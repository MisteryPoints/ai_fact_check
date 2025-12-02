import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { tweetUrl } = await req.json();

    if (!tweetUrl) {
      return new Response(
        JSON.stringify({ error: 'Tweet URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tweetIdMatch = tweetUrl.match(/status\/(\d+)/);
    if (!tweetIdMatch) {
      return new Response(
        JSON.stringify({ error: 'Invalid X/Twitter URL format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const mockTweetContent = `Tweet content from URL: ${tweetUrl}. This is a simulated tweet content for analysis.`;

    const prompt = `Analyze the following tweet/post from X (Twitter) for veracity and truthfulness. Provide:
1. A veracity score from 0-100 (0 = completely false, 100 = completely true)
2. Assessment of correctness
3. Assessment of falsehood or misleading information
4. Brief reasoning for your assessment

Tweet content:
${mockTweetContent}

Respond ONLY with valid JSON in this exact format:
{
  "veracity_score": <number 0-100>,
  "correctness": "<brief assessment>",
  "falsehood": "<brief assessment>",
  "reasoning": "<explanation>"
}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a fact-checking expert. Analyze content for veracity and respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      return new Response(
        JSON.stringify({ error: 'OpenAI API error', details: error }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const analysisText = openaiData.choices[0].message.content;
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse OpenAI response', details: analysisText }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: savedAnalysis, error: dbError } = await supabase
      .from('tweet_analyses')
      .insert({
        tweet_url: tweetUrl,
        tweet_content: mockTweetContent,
        veracity_score: analysis.veracity_score,
        analysis: analysis,
      })
      .select()
      .single();

    if (dbError) {
      return new Response(
        JSON.stringify({ error: 'Database error', details: dbError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: savedAnalysis,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
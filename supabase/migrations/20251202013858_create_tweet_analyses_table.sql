/*
  # Create tweet analyses table

  1. New Tables
    - `tweet_analyses`
      - `id` (uuid, primary key)
      - `tweet_url` (text, the X/Twitter URL)
      - `tweet_content` (text, the extracted tweet content)
      - `veracity_score` (integer, 0-100 percentage)
      - `analysis` (jsonb, detailed OpenAI analysis including correctness, falsehood, reasoning)
      - `created_at` (timestamptz, timestamp of analysis)
      
  2. Security
    - Enable RLS on `tweet_analyses` table
    - Add policy for anyone to insert analyses (public tool)
    - Add policy for anyone to read analyses (public results)
    
  3. Important Notes
    - This is a public tool, so RLS policies allow public access
    - The analysis field stores structured data from OpenAI including veracity percentage, correctness assessment, and falsehood detection
*/

CREATE TABLE IF NOT EXISTS tweet_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_url text NOT NULL,
  tweet_content text NOT NULL,
  veracity_score integer NOT NULL CHECK (veracity_score >= 0 AND veracity_score <= 100),
  analysis jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tweet_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create tweet analyses"
  ON tweet_analyses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view tweet analyses"
  ON tweet_analyses
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tweet_analyses_tweet_url ON tweet_analyses(tweet_url);
CREATE INDEX IF NOT EXISTS idx_tweet_analyses_created_at ON tweet_analyses(created_at DESC);
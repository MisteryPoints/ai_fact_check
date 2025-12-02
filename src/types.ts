export interface TweetAnalysis {
  id: string;
  tweet_url: string;
  tweet_content: string;
  veracity_score: number;
  analysis: {
    veracity_score: number;
    correctness: string;
    falsehood: string;
    reasoning: string;
  };
  created_at: string;
}

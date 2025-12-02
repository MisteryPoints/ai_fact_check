import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { TweetAnalysis } from '../types';

interface AnalysisResultProps {
  analysis: TweetAnalysis;
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="w-16 h-16" />;
    if (score >= 40) return <AlertCircle className="w-16 h-16" />;
    return <XCircle className="w-16 h-16" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
      <div className="flex flex-col items-center mb-8">
        <div className={`${getScoreColor(analysis.veracity_score)} mb-4`}>
          {getScoreIcon(analysis.veracity_score)}
        </div>
        <h2 className="text-3xl font-bold mb-2">Puntuación de Veracidad</h2>
        <div className={`text-6xl font-bold ${getScoreColor(analysis.veracity_score)}`}>
          {analysis.veracity_score}%
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Contenido Analizado</h3>
          <p className="text-gray-600 bg-gray-50 p-4 rounded">{analysis.tweet_content}</p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Evaluación de Veracidad</h3>
          <p className="text-gray-600">{analysis.analysis.correctness}</p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Detección de Falsedad</h3>
          <p className="text-gray-600">{analysis.analysis.falsehood}</p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Razonamiento</h3>
          <p className="text-gray-600">{analysis.analysis.reasoning}</p>
        </div>

        <div className="border-t pt-6">
          <a
            href={analysis.tweet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Ver tweet original en X
          </a>
        </div>
      </div>
    </div>
  );
}

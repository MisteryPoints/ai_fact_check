import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import AnalysisResult from './components/AnalysisResult';
import { TweetAnalysis } from './types';

function App() {
  const [tweetUrl, setTweetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<TweetAnalysis | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAnalysis(null);
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-tweet`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al analizar el tweet');
      }

      setAnalysis(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Verificador de Veracidad
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analiza tweets de X con IA para determinar su nivel de veracidad y detectar información falsa
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8">
          <form onSubmit={handleAnalyze} className="w-full max-w-3xl">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <label htmlFor="tweetUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL del Tweet de X
              </label>
              <div className="flex gap-3">
                <input
                  id="tweetUrl"
                  type="text"
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  placeholder="https://x.com/username/status/1234567890"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !tweetUrl}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Analizar
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ejemplo: https://x.com/username/status/1234567890 o https://twitter.com/username/status/1234567890
              </p>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-3xl w-full">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {analysis && <AnalysisResult analysis={analysis} />}

          {!analysis && !loading && !error && (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Cómo funciona:</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  Copia la URL de cualquier tweet de X
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  Pégala en el campo de arriba
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  Nuestra IA analiza el contenido y determina su veracidad
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  Obtienes un porcentaje de veracidad y un análisis detallado
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

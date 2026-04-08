import { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, History, Info, LayoutDashboard, Database, ShieldCheck, Globe, BarChart3, Clock, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnalysisResult from './components/AnalysisResult';
import { TweetAnalysis } from './types';

type View = 'home' | 'methodology' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [tweetUrl, setTweetUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<TweetAnalysis | null>(null);
  const [history, setHistory] = useState<TweetAnalysis[]>([]);

  // Load history from localStorage safely
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('factcheck_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed.filter(item => item && typeof item === 'object' && 'veracity_score' in item));
        }
      }
    } catch (err) {
      console.error("Error loading history:", err);
      localStorage.removeItem('factcheck_history');
    }
  }, []);

  const saveToHistory = (newAnalysis: TweetAnalysis) => {
    if (!newAnalysis) return;
    const updatedHistory = [newAnalysis, ...history].slice(0, 5); 
    setHistory(updatedHistory);
    localStorage.setItem('factcheck_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('factcheck_history');
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetUrl) return;
    
    setError('');
    setAnalysis(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:3010/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetUrl, imageUrl }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al analizar el tweet');

      setAnalysis(result.data);
      saveToHistory(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido de conexión');
    } finally {
      setLoading(false);
    }
  };

  const renderHome = () => (
    <>
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold mb-6 border border-indigo-100"
        >
          <Sparkles className="w-4 h-4" />
          IA de Fact-Checking Universitaria
        </motion.div>
        <motion.h1 
          className="text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8"
        >
          Verificación en <br/>
          Tiempo <span className="text-indigo-600 italic">Real</span>.
        </motion.h1>
      </div>

      <div className="max-w-3xl mx-auto mb-16 w-full">
        <form onSubmit={handleAnalyze} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-20 transition duration-1000 group-hover:opacity-30"></div>
          <div className="relative glass rounded-[2rem] p-4 flex flex-col gap-4 items-stretch border-2 border-white/50">
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  placeholder="Pega el enlace del tweet (X.com)..."
                  className="w-full pl-14 pr-6 py-4 bg-transparent border-none focus:ring-0 text-lg text-slate-800"
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading || !tweetUrl} className="btn-primary min-w-[200px]">
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Verificar Post"}
              </button>
            </div>
            {/* Optional Image URL Input */}
            <div className="w-full relative border-t border-slate-100/50 pt-2">
              <ImageIcon className="absolute left-5 top-[60%] -translate-y-1/2 w-5 h-5 text-indigo-300" />
              <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="[OPCIONAL] URL de Imagen como Evidencia (Multimodal)"
                  className="w-full pl-14 pr-6 py-2 bg-transparent text-sm border-none focus:ring-0 text-slate-600 placeholder-indigo-300/70"
                  disabled={loading}
              />
            </div>
          </div>
        </form>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-50 p-6 rounded-3xl border border-rose-100 text-rose-800 flex gap-4">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div><h4 className="font-bold">Error</h4><p>{error}</p></div>
            </motion.div>
          )}
          {analysis && <AnalysisResult key="result" analysis={analysis} />}
          {!analysis && !loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Detección Rápida', icon: Globe, desc: 'Escaneamos fuentes globales en segundos.' },
                { title: 'IA de Confianza', icon: ShieldCheck, desc: 'Algoritmos optimizados para uso académico.' },
                { title: 'Sin Sesgos', icon: Database, desc: 'Análisis basado estrictamente en hechos.' }
              ].map((f, i) => (
                <div key={i} className="glass p-8 rounded-3xl border border-slate-100">
                  <f.icon className="w-10 h-10 text-indigo-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  const renderMethodology = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">Nuestra Metodología</h2>
        <p className="text-slate-500 text-lg">Cómo garantizamos la veracidad de la información.</p>
      </div>
      <div className="grid gap-8">
        {[
          { step: 1, title: 'Búsqueda Contextual', desc: 'Identificamos el núcleo del mensaje y buscamos referencias en bases de datos oficiales.', icon: Search },
          { step: 2, title: 'Contrastación de Fuentes', desc: 'Comparamos la información con fuentes independientes de alta credibilidad.', icon: Globe },
          { step: 3, title: 'Análisis por IA', desc: 'Utilizamos modelos procesadores de lenguaje natural para detectar inconsistencias.', icon: Sparkles },
          { step: 4, title: 'Generación de Informe', desc: 'Sintetizamos los hallazgos en un informe detallado con un puntaje de veracidad.', icon: BarChart3 }
        ].map((m, i) => (
          <div key={i} className="glass p-8 rounded-3xl border border-slate-100 flex gap-8 items-center group">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0">{m.step}</div>
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <m.icon className="w-5 h-5 text-indigo-500" /> {m.title}
              </h3>
              <p className="text-slate-600">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderDashboard = () => {
    // Safety check for history calculations
    const safeHistory = Array.isArray(history) ? history : [];
    const totalAnalyzed = safeHistory.length;
    const avgScore = totalAnalyzed > 0 
      ? Math.round(safeHistory.reduce((acc, current) => acc + (current?.veracity_score || 0), 0) / totalAnalyzed) 
      : 0;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-bold mb-2 tracking-tight text-slate-900">Historial y Estadísticas</h2>
            <p className="text-slate-500 font-medium">Datos acumulados en esta sesión.</p>
          </div>
          {totalAnalyzed > 0 && (
            <button onClick={clearHistory} className="flex items-center gap-2 text-rose-600 hover:text-rose-700 transition-colors text-sm font-bold bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
              <Trash2 className="w-4 h-4" /> Borrar Todo
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <BarChart3 className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
            <h4 className="opacity-70 text-xs font-black uppercase tracking-widest mb-1">Total Analizados</h4>
            <span className="text-5xl font-black">{totalAnalyzed}</span>
          </div>
          <div className="glass p-8 rounded-3xl border border-slate-200">
            <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Puntaje Promedio</h4>
            <span className="text-5xl font-black text-slate-800">{avgScore}%</span>
          </div>
          <div className="glass p-8 rounded-3xl border border-slate-200">
            <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Fiabilidad Media</h4>
            <span className="text-xl font-bold text-emerald-600 flex items-center gap-2 mt-2">
              <ShieldCheck className="w-6 h-6" /> {avgScore > 70 ? 'Alta' : avgScore > 40 ? 'Media' : 'Baja'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {safeHistory.map((h, i) => (
            <div key={h?.id || i} className="glass p-6 rounded-2xl border border-white/50 flex items-center justify-between hover:border-indigo-200 transition-colors group">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className={`w-3 h-3 rounded-full shrink-0 ${h.veracity_score > 70 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-800 truncate">{h.tweet_url}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {h.created_at ? new Date(h.created_at).toLocaleTimeString() : '--:--'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono font-bold text-slate-600">{h.veracity_score}%</span>
                <button 
                  onClick={() => { setAnalysis(h); setCurrentView('home'); }} 
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {totalAnalyzed === 0 && (
            <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 bg-white/50">
              <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
              Aún no has realizado ninguna investigación.
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 glass border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Verifact AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            {[
              { id: 'home', label: 'Inicio', icon: Globe },
              { id: 'methodology', label: 'Metodología', icon: Info },
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setCurrentView(v.id as View)}
                className={`flex items-center gap-2 ${currentView === v.id ? 'text-indigo-600' : 'hover:text-slate-800'}`}
              >
                <v.icon className="w-4 h-4" /> {v.label}
              </button>
            ))}
          </div>
          <div className="text-xs font-mono text-slate-400">v1.3.0-DEMO</div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {currentView === 'home' && renderHome()}
          {currentView === 'methodology' && renderMethodology()}
          {currentView === 'dashboard' && renderDashboard()}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] flex flex-col items-center gap-2">
        <span>Verifact AI — Proyecto Final Universitario — 2026</span>
        <span className="text-indigo-400 font-bold">Desarrollado por Tharsis Gabriel</span>
      </footer>
    </div>
  );
}

export default App;

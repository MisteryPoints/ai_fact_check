import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, ExternalLink, ShieldCheck, Share2, ClipboardCheck } from 'lucide-react';
import { TweetAnalysis } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

interface AnalysisResultProps {
  analysis: TweetAnalysis;
}

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

const AnalysisResult = ({ analysis }: AnalysisResultProps) => {
  const [copied, setCopied] = useState(false);
  const score = analysis.analysis.veracity_score;
  
  const getStatusColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getStatusBg = (s: number) => {
    if (s >= 80) return 'bg-emerald-50';
    if (s >= 50) return 'bg-amber-50';
    return 'bg-rose-50';
  };

  const getStatusIcon = (s: number) => {
    if (s >= 80) return <CheckCircle2 className="w-8 h-8" />;
    if (s >= 50) return <AlertCircle className="w-8 h-8" />;
    return <XCircle className="w-8 h-8" />;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(analysis.tweet_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenSource = () => {
    if (analysis.tweet_url) {
      window.open(analysis.tweet_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl space-y-6"
    >
      {/* Header Card */}
      <div className="glass rounded-3xl overflow-hidden border-2 border-white/50">
        <div className={cn("p-8 flex flex-col md:flex-row items-center gap-8", getStatusBg(score))}>
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-200"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="364.42"
                initial={{ strokeDashoffset: 364.42 }}
                animate={{ strokeDashoffset: 364.42 - (364.42 * score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={getStatusColor(score)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-3xl font-bold font-mono", getStatusColor(score))}>
                {score}%
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-3", getStatusBg(score), getStatusColor(score))}>
              {getStatusIcon(score)}
              {score >= 80 ? 'Altamente Veraz' : score >= 50 ? 'Información Mixta' : 'Potencialmente Falso'}
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Análisis de Veracidad</h2>
            <p className="text-slate-600 leading-relaxed max-w-xl text-sm italic">
              {analysis.tweet_content}
            </p>
          </div>
        </div>

        <div className="p-8 bg-white/40 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Puntos Correctos</h4>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">{analysis.analysis.correctness}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Inconsistencias</h4>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">{analysis.analysis.falsehood}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col justify-center">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5" />
              Conclusión del Experto
            </h4>
            <p className="text-indigo-800 text-sm leading-relaxed italic border-l-4 border-indigo-200 pl-4 py-1">
              "{analysis.analysis.reasoning}"
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold shadow-sm active:scale-95"
        >
          {copied ? <ClipboardCheck className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          {copied ? "Enlace Copiado" : "Compartir Informe"}
        </button>
        <button 
          onClick={handleOpenSource}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg active:scale-95 disabled:opacity-50"
          disabled={!analysis.tweet_url}
        >
          <ExternalLink className="w-4 h-4" />
          Ver Fuente Original
        </button>
      </div>
    </motion.div>
  );
};

export default AnalysisResult;

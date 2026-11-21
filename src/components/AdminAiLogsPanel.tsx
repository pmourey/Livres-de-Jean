import React, { useEffect, useState } from 'react';
import { PAYMENTS_API_BASE } from '../config/commerce';
import {
  Sparkles,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Globe,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Download
} from 'lucide-react';

interface AiQueryLog {
  id: number;
  question: string;
  scope: string;
  use_google_search: number;
  chunks_used: number;
  agoravox_used: number;
  academic_used: number;
  web_sources_used: number;
  model: string;
  feedback: number;
  created_at: string;
}

export const AdminAiLogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<AiQueryLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'gaps' | 'negative' | 'positive'>('all');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('emile_mourey_admin_token') || '';
      const res = await fetch(`${PAYMENTS_API_BASE}/api/admin/ai-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Erreur serveur (${res.status})`);
      }
      setLogs(Array.isArray(data?.logs) ? data.logs : []);
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les journaux IA.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (filter === 'gaps') return l.chunks_used === 0 || l.academic_used === 0;
    if (filter === 'negative') return l.feedback === -1;
    if (filter === 'positive') return l.feedback === 1;
    return true;
  });

  const gapsCount = logs.filter((l) => l.chunks_used === 0 || l.academic_used === 0).length;
  const negativeCount = logs.filter((l) => l.feedback === -1).length;
  const positiveCount = logs.filter((l) => l.feedback === 1).length;

  const handleExportJsonl = () => {
    const content = filteredLogs.map((l) => JSON.stringify(l)).join('\n');
    const blob = new Blob([content], { type: 'application/jsonl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-query-logs-${new Date().toISOString().slice(0, 10)}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="space-y-1">
          <h3 className="font-serif-display font-bold text-xl text-[#2B1810] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8B1E2D]" />
            <span>Journal des Requêtes IA & Détection des Trous Documentaires (RAG)</span>
          </h3>
          <p className="text-xs text-stone-500">
            Suivi anonymisé des 100 dernières questions lecteurs, couverture des 3 corpus D1 + Google Search et retours 👍 / 👎 pour enrichir la base.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportJsonl}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-800 border border-stone-300 rounded text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter JSONL</span>
          </button>
          <button
            type="button"
            onClick={() => void fetchLogs()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8B1E2D] hover:bg-[#721824] disabled:opacity-50 text-white rounded text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-md font-semibold border cursor-pointer ${
            filter === 'all'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
          }`}
        >
          Toutes ({logs.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('gaps')}
          className={`px-3 py-1.5 rounded-md font-semibold border cursor-pointer inline-flex items-center gap-1.5 ${
            filter === 'gaps'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Trous documentaires ({gapsCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('negative')}
          className={`px-3 py-1.5 rounded-md font-semibold border cursor-pointer inline-flex items-center gap-1.5 ${
            filter === 'negative'
              ? 'bg-rose-700 text-white border-rose-700'
              : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>À enrichir ({negativeCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('positive')}
          className={`px-3 py-1.5 rounded-md font-semibold border cursor-pointer inline-flex items-center gap-1.5 ${
            filter === 'positive'
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Utiles ({positiveCount})</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
          {error}
        </div>
      )}

      {filteredLogs.length === 0 && !isLoading ? (
        <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-lg border border-stone-200">
          Aucune requête enregistrée pour ce filtre. Les questions posées sur l'Assistant IA apparaîtront automatiquement ici.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Question lecteur</th>
                <th className="py-2.5 px-3">Périmètre</th>
                <th className="py-2.5 px-3">Sources trouvées</th>
                <th className="py-2.5 px-3">Retour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/70 align-top">
                  <td className="py-3 px-3 whitespace-nowrap text-[11px] text-stone-500 font-mono">
                    {log.created_at}
                  </td>
                  <td className="py-3 px-3 text-stone-800 max-w-md">
                    <p className="font-medium leading-snug">{log.question}</p>
                    <span className="text-[10px] text-stone-400 font-mono">{log.model}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px] font-mono text-stone-700">
                      {log.scope}
                    </span>
                    {log.use_google_search === 1 && (
                      <span className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 text-[10px] font-semibold">
                        <Globe className="w-2.5 h-2.5" />
                        Web
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                          log.chunks_used === 0
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-stone-100 text-stone-800 border-stone-200'
                        }`}
                        title="Passages de livres"
                      >
                        <BookOpen className="w-2.5 h-2.5" />
                        {log.chunks_used}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50/60 text-amber-950 border border-amber-200"
                        title="Extraits AgoraVox"
                      >
                        <MessageSquare className="w-2.5 h-2.5" />
                        {log.agoravox_used}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                          log.academic_used === 0
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}
                        title="Publications CNRS/HAL/Persée"
                      >
                        <GraduationCap className="w-2.5 h-2.5" />
                        {log.academic_used}
                      </span>
                      {log.web_sources_used > 0 && (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-200"
                          title="Sources Web Google Search"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          {log.web_sources_used}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {log.feedback === 1 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <ThumbsUp className="w-3 h-3" /> Utile
                      </span>
                    ) : log.feedback === -1 ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                        <ThumbsDown className="w-3 h-3" /> À enrichir
                      </span>
                    ) : (
                      <span className="text-stone-400 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

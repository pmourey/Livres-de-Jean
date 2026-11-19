import React, { useEffect, useState } from 'react';
import { PAYMENTS_API_BASE } from '../config/commerce';
import {
  ShieldCheck,
  Check,
  X,
  Clock,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  FileCheck2
} from 'lucide-react';

export interface ModeratedComment {
  id: number;
  target_slug: string;
  user_id: string;
  author_name: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  charter_accepted_at: string;
  created_at: string;
  moderated_at?: string | null;
}

export const AdminModerationPanel: React.FC = () => {
  const [comments, setComments] = useState<ModeratedComment[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const getAdminToken = () => sessionStorage.getItem('emile_mourey_admin_token') || '';

  const fetchComments = async () => {
    const token = getAdminToken();
    if (!token) {
      setError('Jeton administrateur absent. Veuillez vous reconnecter au Back-Office.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${PAYMENTS_API_BASE}/api/admin/comments?status=all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(
            "Route /api/admin/comments non encore déployée sur votre Cloudflare Worker. Exécutez 'npx wrangler deploy' et appliquez la migration D1."
          );
        }
        throw new Error(data?.error || `Erreur d'autorisation ou serveur (${res.status})`);
      }
      setComments(Array.isArray(data?.comments) ? data.comments : []);
    } catch (err: any) {
      setError(err?.message || 'Impossible de récupérer la file de modération.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchComments();
  }, []);

  const handleModerate = async (id: number, status: 'approved' | 'rejected') => {
    const token = getAdminToken();
    if (!token) {
      setError('Session administrateur expirée.');
      return;
    }

    setActionId(id);
    setFeedback(null);
    setError(null);
    try {
      const res = await fetch(`${PAYMENTS_API_BASE}/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Échec de la modération (${res.status})`);
      }

      setComments((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status,
                moderated_at: data?.comment?.moderated_at || new Date().toISOString()
              }
            : c
        )
      );
      setFeedback(
        status === 'approved'
          ? `Commentaire #${id} approuvé et publié.`
          : `Commentaire #${id} refusé.`
      );
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la mise à jour du statut.');
    } finally {
      setActionId(null);
    }
  };

  const pendingCount = comments.filter((c) => c.status === 'pending').length;
  const approvedCount = comments.filter((c) => c.status === 'approved').length;
  const rejectedCount = comments.filter((c) => c.status === 'rejected').length;

  const visibleComments =
    filter === 'all' ? comments : comments.filter((c) => c.status === filter);

  return (
    <div className="space-y-6">
      {/* En-tête de la vue privée /admin/moderation */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#8B1E2D]" />
            <h3 className="font-serif-display text-xl font-bold text-[#2B1810]">
              Modération a priori des commentaires
            </h3>
            <span className="text-[11px] font-mono bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded">
              /admin/moderation
            </span>
          </div>
          <p className="text-xs text-stone-600">
            Vue protégée par vérification de rôle administrateur côté Cloudflare Worker (`PATCH /api/admin/comments/:id`). Les messages restent invisibles tant qu'ils ne sont pas approuvés.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchComments()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-md transition-colors shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualiser la file</span>
        </button>
      </div>

      {/* Filtres de statut */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-3.5 py-2 rounded-md font-semibold border transition-colors cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-500 text-stone-950 border-amber-600'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          En attente ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('approved')}
          className={`px-3.5 py-2 rounded-md font-semibold border transition-colors cursor-pointer ${
            filter === 'approved'
              ? 'bg-emerald-700 text-white border-emerald-800'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Approuvés ({approvedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('rejected')}
          className={`px-3.5 py-2 rounded-md font-semibold border transition-colors cursor-pointer ${
            filter === 'rejected'
              ? 'bg-rose-700 text-white border-rose-800'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Refusés ({rejectedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-2 rounded-md font-semibold border transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Tous ({comments.length})
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Liste des commentaires à modérer */}
      {isLoading ? (
        <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-xs text-stone-500">
          Chargement des commentaires depuis Cloudflare D1...
        </div>
      ) : visibleComments.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-8 text-center space-y-2">
          <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="font-serif-display font-semibold text-base text-stone-700">
            Aucun commentaire dans cette catégorie.
          </p>
          <p className="text-xs text-stone-500">
            Les nouveaux messages soumis par les lecteurs authentifiés apparaîtront ici avec le statut « En attente ».
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <article
              key={comment.id}
              className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-stone-500">
                      #{comment.id}
                    </span>
                    <strong className="text-sm text-[#2B1810]">{comment.author_name}</strong>
                    <span className="text-[11px] font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                      {comment.target_slug}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        comment.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comment.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {comment.status === 'approved'
                        ? 'Approuvé'
                        : comment.status === 'rejected'
                        ? 'Refusé'
                        : 'En attente'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Reçu : {comment.created_at}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <FileCheck2 className="w-3 h-3" />
                      Charte acceptée (ISO) : {comment.charter_accepted_at}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">
                      user_id: {comment.user_id}
                    </span>
                  </div>
                </div>

                {/* Boutons d'action de modération */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={actionId === comment.id || comment.status === 'approved'}
                    onClick={() => void handleModerate(comment.id, 'approved')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approuver</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionId === comment.id || comment.status === 'rejected'}
                    onClick={() => void handleModerate(comment.id, 'rejected')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Refuser</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line bg-[#FAF8F5] p-3.5 rounded-lg border border-stone-200/80">
                {comment.content}
              </p>

              {comment.moderated_at && (
                <p className="text-[11px] text-stone-400">
                  Modéré le : {comment.moderated_at}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

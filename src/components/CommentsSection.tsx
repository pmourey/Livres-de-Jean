import React, { useEffect, useState } from 'react';
import { PAYMENTS_API_BASE } from '../config/commerce';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  User
} from 'lucide-react';

export interface PublicComment {
  id: number;
  target_slug: string;
  author_name: string;
  content: string;
  status: 'approved';
  created_at: string;
  moderated_at?: string | null;
}

interface CommentsSectionProps {
  targetSlug: string;
  customerToken: string;
  defaultAuthorName?: string;
  onNavigateAccount: () => void;
  onNavigateLegal?: () => void;
}

const MAX_CONTENT_LENGTH = 1500;

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  targetSlug,
  customerToken,
  defaultAuthorName = '',
  onNavigateAccount,
  onNavigateLegal
}) => {
  const isAuthenticated = Boolean(customerToken && customerToken.trim());

  const [comments, setComments] = useState<PublicComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState(defaultAuthorName);
  const [content, setContent] = useState('');
  const [charterAccepted, setCharterAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authorName && defaultAuthorName) {
      setAuthorName(defaultAuthorName);
    }
  }, [defaultAuthorName]);

  const fetchApprovedComments = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(
        `${PAYMENTS_API_BASE}/api/comments?slug=${encodeURIComponent(targetSlug)}`
      );
      if (!res.ok) {
        if (res.status === 404) {
          // Worker not yet redeployed with /api/comments route
          setComments([]);
          return;
        }
        throw new Error(`Erreur serveur (${res.status})`);
      }
      const data = await res.json();
      setComments(Array.isArray(data?.comments) ? data.comments : []);
    } catch {
      setLoadError('Impossible de charger les commentaires publiés pour le moment.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchApprovedComments();
  }, [targetSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!isAuthenticated) {
      setSubmitError('Veuillez vous connecter pour publier un commentaire.');
      return;
    }
    if (!charterAccepted) {
      setSubmitError(
        "Vous devez cocher la case d'acceptation de la charte légale (RGPD / LCEN) avant l'envoi."
      );
      return;
    }
    const trimmedAuthor = authorName.trim();
    const trimmedContent = content.trim();
    if (trimmedAuthor.length < 2) {
      setSubmitError('Veuillez saisir un pseudonyme d’au moins 2 caractères.');
      return;
    }
    if (!trimmedContent || trimmedContent.length > MAX_CONTENT_LENGTH) {
      setSubmitError(`Le message doit contenir entre 1 et ${MAX_CONTENT_LENGTH} caractères.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${PAYMENTS_API_BASE}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`
        },
        body: JSON.stringify({
          target_slug: targetSlug,
          author_name: trimmedAuthor,
          content: trimmedContent,
          charterAccepted: true
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error ||
            (res.status === 401
              ? 'Votre session a expiré. Veuillez vous reconnecter depuis votre Espace Client.'
              : "Impossible d'enregistrer votre commentaire.")
        );
      }

      setContent('');
      setCharterAccepted(false);
      setSubmitSuccess(
        data?.message ||
          'Votre commentaire a été enregistré en attente de modération a priori. Il apparaîtra ici dès validation.'
      );
    } catch (err: any) {
      setSubmitError(err?.message || "Erreur réseau lors de l'envoi du commentaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z');
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  return (
    <section
      id="commentaires-moderes"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6"
    >
      {/* En-tête de l'espace de commentaires */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="space-y-1">
          <span className="font-cinzel text-xs uppercase tracking-widest text-[#8B1E2D] font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Modération a priori · RGPD & LCEN</span>
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1810]">
            Espace de commentaires des lecteurs
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
            Les contributions sont publiées après validation par l'équipe éditoriale afin de garantir la tenue scientifique et la courtoisie des débats.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchApprovedComments()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-[#8B1E2D] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualiser ({comments.length})</span>
        </button>
      </div>

      {/* Formulaire réservé aux utilisateurs authentifiés */}
      {isAuthenticated ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#8B1E2D]" />
              <h3 className="font-serif-display font-bold text-lg text-[#2B1810]">
                Contribuer au dossier
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <User className="w-3 h-3" />
              <span>Lecteur authentifié</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="comment-author-name"
                className="block text-xs font-semibold text-stone-700 mb-1"
              >
                Pseudonyme affiché *
              </label>
              <input
                id="comment-author-name"
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex : Jean-Luc M., historien amateur"
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B1E2D] focus:bg-white"
              />
            </div>
            <div className="flex items-end">
              <p className="text-[11px] text-stone-500 leading-snug">
                Votre adresse e-mail de connexion n'est jamais affichée publiquement ; seul votre pseudonyme apparaît après validation.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="comment-content"
                className="block text-xs font-semibold text-stone-700"
              >
                Votre commentaire argumenté *
              </label>
              <span
                className={`text-[11px] font-mono tabular-nums ${
                  content.length > MAX_CONTENT_LENGTH - 100
                    ? 'text-[#8B1E2D] font-bold'
                    : 'text-stone-500'
                }`}
              >
                {content.length} / {MAX_CONTENT_LENGTH}
              </span>
            </div>
            <textarea
              id="comment-content"
              required
              rows={4}
              maxLength={MAX_CONTENT_LENGTH}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Partagez votre analyse, une référence antique, une question topographique ou une objection constructive..."
              className="w-full px-3 py-2.5 text-xs bg-[#FAF8F5] border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B1E2D] focus:bg-white leading-relaxed"
            />
          </div>

          {/* Case obligatoire d'acceptation de la charte légale (RGPD / LCEN) */}
          <div className="p-3.5 bg-[#FAF8F5] border border-stone-200 rounded-lg">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={charterAccepted}
                onChange={(e) => setCharterAccepted(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[#8B1E2D] focus:ring-[#8B1E2D]"
              />
              <span className="text-[11px] text-stone-700 leading-relaxed">
                <strong>Acceptation obligatoire de la charte légale (RGPD / LCEN) :</strong> Je certifie que mon commentaire respecte la courtoisie du débat et les lois en vigueur, et j'accepte la modération a priori ainsi que l'enregistrement horodaté de ce consentement conformément à la{' '}
                {onNavigateLegal ? (
                  <button
                    type="button"
                    onClick={onNavigateLegal}
                    className="font-semibold text-[#8B1E2D] hover:underline cursor-pointer"
                  >
                    Charte et Mentions légales
                  </button>
                ) : (
                  <strong>Charte et Mentions légales</strong>
                )}
                .
              </span>
            </label>
          </div>

          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{submitSuccess}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-500">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Statut initial : en attente de validation éditoriale</span>
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !charterAccepted || !content.trim() || !authorName.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1E2D] hover:bg-[#721824] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Envoi en cours...' : 'Soumettre pour modération'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#F5F1E9] border border-stone-300/80 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-stone-900 text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif-display font-bold text-base text-[#2B1810]">
                Connectez-vous pour participer au débat
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                Le formulaire de commentaire est réservé aux lecteurs authentifiés (authentification Cloudflare de votre Espace Client). Chaque message est soumis à modération a priori.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateAccount}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-md transition-colors shrink-0 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Se connecter (Espace Client)</span>
          </button>
        </div>
      )}

      {/* Liste des commentaires approuvés */}
      <div className="space-y-3">
        {loadError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-xs text-stone-500">
            Chargement des commentaires validés...
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-6 text-center space-y-1">
            <p className="font-serif-display font-semibold text-base text-stone-700">
              Aucun commentaire publié pour l'instant sur ce dossier.
            </p>
            <p className="text-xs text-stone-500">
              Soyez le premier lecteur authentifié à partager une analyse ou une question.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <article
                key={c.id}
                className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#2B1810] text-[#D4AF37] font-serif-display font-bold text-xs flex items-center justify-center">
                      {c.author_name.charAt(0).toUpperCase()}
                    </span>
                    <strong className="text-xs sm:text-sm text-[#2B1810]">
                      {c.author_name}
                    </strong>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Publié le {formatDate(c.created_at)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {c.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

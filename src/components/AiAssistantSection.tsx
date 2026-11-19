import React, { useEffect, useRef, useState } from 'react';
import { Book } from '../types';
import { STUDY_DOSSIERS } from '../data/studyDossiers';
import { PAYMENTS_API_BASE } from '../config/commerce';
import {
  Sparkles,
  Send,
  Lock,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Database,
  Gift,
  Compass,
  Loader2
} from 'lucide-react';

interface AiReference {
  bookId: string;
  title: string;
  tome?: string;
  pages?: number[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  references?: AiReference[];
  mode?: 'd1_literal' | 'catalog_synthesis';
  indexedChunksUsed?: number;
  model?: string;
  timestamp: string;
}

interface AiAssistantSectionProps {
  books: Book[];
  customerToken: string;
  customerEmail?: string;
  onSelectBook: (book: Book) => void;
  onNavigateAccount: () => void;
  onNavigateMethod: () => void;
}

const SUGGESTED_QUESTIONS = [
  "Où Émile Mourey situe-t-il Bibracte et quel rôle stratégique attribue-t-il au mont Beuvray ?",
  "Que signifie « altero die » dans sa relecture d'Alésia et pourquoi déplace-t-il l'assaut sur la montagne de Bussy ?",
  "Quelle est sa thèse sur le judéo-druidisme et les sculptures romanes de Chalon-sur-Saône et Vézelay ?",
  "Comment Émile Mourey interprète-t-il les figures prophétiques et les « épouses » dans Histoire de Mahomet ?"
];

/**
 * Rendu éditorial propre du Markdown renvoyé par Gemini (titres, citations, listes, gras, italique)
 * sans aucune dépendance externe et sans HTML brut.
 */
const renderInlineFormatting = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-[#2B1810]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={`i-${keyIdx++}`} className="italic text-stone-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
};

const FormattedAiText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.replace(/\r/g, '').split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let quoteLines: string[] = [];
  let blockKey = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`ul-${blockKey++}`} className="space-y-2 pl-1 my-2">
        {listItems.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-stone-800 leading-relaxed">
            <span className="text-[#8B1E2D] font-bold mt-0.5 shrink-0">•</span>
            <span>{renderInlineFormatting(item)}</span>
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  const flushQuote = () => {
    if (quoteLines.length === 0) return;
    elements.push(
      <blockquote
        key={`bq-${blockKey++}`}
        className="my-2.5 pl-4 pr-3 py-2.5 bg-[#FAF8F5] border-l-3 border-[#8B1E2D] rounded-r-md font-serif-display italic text-stone-800 text-sm leading-relaxed"
      >
        {renderInlineFormatting(quoteLines.join(' '))}
      </blockquote>
    );
    quoteLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      flushQuote();
      continue;
    }

    if (line.startsWith('>')) {
      flushList();
      quoteLines.push(line.replace(/^>\s?/, ''));
      continue;
    }

    flushQuote();

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      elements.push(
        <h4
          key={`h-${blockKey++}`}
          className={`font-serif-display font-bold text-[#2B1810] pt-2 pb-1 border-b border-stone-100 ${
            level <= 2 ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          }`}
        >
          {renderInlineFormatting(headingText)}
        </h4>
      );
      continue;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${blockKey++}`} className="text-stone-800 leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  flushList();
  flushQuote();

  return <div className="space-y-2.5">{elements}</div>;
};

export const AiAssistantSection: React.FC<AiAssistantSectionProps> = ({
  books,
  customerToken,
  customerEmail,
  onSelectBook,
  onNavigateAccount,
  onNavigateMethod
}) => {
  const isAuthenticated = Boolean(customerToken && customerToken.trim());

  const [isCheckingSub, setIsCheckingSub] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    return localStorage.getItem('emile_mourey_ai_beta_sub') === 'active';
  });
  const [subPlan, setSubPlan] = useState<string | null>(
    localStorage.getItem('emile_mourey_ai_beta_sub') === 'active' ? 'beta_free' : null
  );
  const [indexedChunksCount, setIndexedChunksCount] = useState<number>(0);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [questionInput, setQuestionInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsSubscribed(false);
      return;
    }

    const checkSubscription = async () => {
      setIsCheckingSub(true);
      setSubError(null);
      try {
        const res = await fetch(`${PAYMENTS_API_BASE}/api/ai/subscription`, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsSubscribed(Boolean(data?.subscribed));
          setSubPlan(data?.plan || null);
          setIndexedChunksCount(Number(data?.indexedChunksCount || 0));
          setGeminiConfigured(typeof data?.geminiConfigured === 'boolean' ? data.geminiConfigured : null);
          if (data?.subscribed) {
            localStorage.setItem('emile_mourey_ai_beta_sub', 'active');
          }
        }
      } catch {
        // Keep local test state if worker not reachable
      } finally {
        setIsCheckingSub(false);
      }
    };

    void checkSubscription();
  }, [isAuthenticated, customerToken]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const handleActivateFreeBeta = async () => {
    setIsActivating(true);
    setSubError(null);
    try {
      const res = await fetch(`${PAYMENTS_API_BASE}/api/ai/subscription/activate-beta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`
        }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(
            "L'endpoint /api/ai/subscription/activate-beta n'est pas encore déployé sur votre Cloudflare Worker. Exécutez 'npx wrangler deploy' après avoir configuré GEMINI_API_KEY."
          );
        }
        throw new Error(data?.error || `Erreur serveur (${res.status})`);
      }

      setIsSubscribed(true);
      setSubPlan('beta_free');
      localStorage.setItem('emile_mourey_ai_beta_sub', 'active');
    } catch (err: any) {
      setSubError(err?.message || "Impossible d'activer l'abonnement de test.");
    } finally {
      setIsActivating(false);
    }
  };

  /**
   * Construit un contexte de repli structuré (notices, citations et dossiers d'études)
   * utilisé automatiquement par le Worker tant que les 12 PDF complets ne sont pas encore
   * ingérés dans la table D1 `book_chunks`.
   */
  const buildFallbackContext = (query: string) => {
    const q = query.toLowerCase();
    const targetBooks = selectedBookId
      ? books.filter((b) => b.id === selectedBookId)
      : books;

    const scoredBooks = targetBooks
      .map((book) => {
        const blob = [
          book.title,
          book.subtitle,
          book.tome || '',
          book.category,
          book.shortDescription,
          ...(book.fullSynopsis || []),
          ...(book.keyQuotes || []),
          ...(book.tableOfContents || [])
        ]
          .join(' ')
          .toLowerCase();

        const words = q.split(/\s+/).filter((w) => w.length >= 3);
        const score = words.reduce((acc, w) => (blob.includes(w) ? acc + 1 : acc), 0);
        return { book, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, selectedBookId ? 1 : 6);

    const bookContexts = scoredBooks.map(({ book }) => ({
      bookId: book.id,
      title: book.title,
      tome: book.tome || '',
      excerpt: [
        `Sous-titre : ${book.subtitle}`,
        `Synopsis : ${(book.fullSynopsis || []).join(' ')}`,
        book.tableOfContents?.length
          ? `Table des matières : ${book.tableOfContents.join(' ; ')}`
          : '',
        book.keyQuotes?.length ? `Citations clés : ${book.keyQuotes.join(' | ')}` : '',
        book.excerptPages?.length
          ? `Extrait littéral : ${book.excerptPages.slice(0, 2).join(' ')}`
          : ''
      ]
        .filter(Boolean)
        .join('\n')
        .slice(0, 2400)
    }));

    const matchingDossiers = STUDY_DOSSIERS.slice(0, 7).map((d) => ({
      bookId: d.relatedBookIds[0] || '',
      title: `Dossier d'étude ${d.number} — ${d.title}`,
      tome: d.domain,
      excerpt: [
        d.lead,
        `Thèse d'Émile Mourey : ${d.moureyPoints.join(' ')}`,
        `Contrepoint académique (${d.academicCounterpointTitle}) : ${d.academicCounterpoint}`
      ].join('\n')
    }));

    return [...bookContexts, ...matchingDossiers].slice(0, 12);
  };

  const handleAsk = async (questionOverride?: string) => {
    const q = (questionOverride ?? questionInput).trim();
    if (!q || isAsking) return;

    setAskError(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionOverride) setQuestionInput('');
    setIsAsking(true);

    try {
      const res = await fetch(`${PAYMENTS_API_BASE}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`
        },
        body: JSON.stringify({
          question: q,
          bookId: selectedBookId || undefined,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          fallbackContext: buildFallbackContext(q)
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 402 || data?.code === 'SUBSCRIPTION_REQUIRED') {
          setIsSubscribed(false);
          localStorage.removeItem('emile_mourey_ai_beta_sub');
        }
        if (res.status === 404) {
          throw new Error(
            "La route /api/ai/ask n'est pas encore déployée sur votre Cloudflare Worker. Exécutez 'npx wrangler secret put GEMINI_API_KEY' puis 'npx wrangler deploy'."
          );
        }
        throw new Error(data?.error || `Erreur serveur (${res.status})`);
      }

      const aiMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.answer,
        references: Array.isArray(data.references) ? data.references : [],
        mode: data.mode,
        indexedChunksUsed: data.indexedChunksUsed,
        model: data.model,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setAskError(err?.message || "Impossible d'obtenir une réponse de l'Assistant IA.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-10 pb-14">
      {/* Hero En-tête du Module IA */}
      <section className="relative overflow-hidden bg-[#241310] text-[#FAF8F5] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 rounded-b-2xl shadow-xl">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />
        <div className="relative max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[#D4AF37] text-xs font-cinzel tracking-[0.2em] uppercase font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Assistant Documentaire IA · Google Gemini</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
              <Gift className="w-3 h-3" />
              <span>Phase de test : Abonnement offert (0 €)</span>
            </span>
          </div>

          <h1 className="font-serif-display text-3xl sm:text-5xl font-bold text-white leading-tight">
            Interroger l’Œuvre d’Émile Mourey en temps réel
          </h1>

          <p className="font-serif-display italic text-base sm:text-xl text-stone-200 max-w-3xl leading-relaxed">
            Posez vos questions sur les positions d'Émile Mourey — Bibracte, Alésia, Gergovie, art roman bourguignon, Histoire du Christ ou Histoire de Mahomet — et obtenez une synthèse argumentée appuyée sur les références exactes de ses 12 ouvrages.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-stone-300">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              <span>Corpus : 12 ouvrages & 7 dossiers d'études</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {indexedChunksCount > 0
                  ? `${indexedChunksCount.toLocaleString('fr-FR')} passages littéraux PDF indexés dans D1`
                  : 'Mode RAG prêt (index littéral D1 + notices des 12 ouvrages)'}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Clé API sécurisée côté Cloudflare Worker</span>
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ÉTAPE 1 : Non connecté */}
        {!isAuthenticated ? (
          <div className="bg-white border-2 border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Accès sur abonnement · Offert en phase de test</span>
                </span>
                <h2 className="font-serif-display text-2xl font-bold text-[#2B1810]">
                  Connectez-vous pour activer votre accès offert
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  L'accès à l'Assistant IA nécessite un compte lecteur (authentification Cloudflare) et un abonnement actif. Durant la phase de test actuelle, <strong>l'abonnement est intégralement offert</strong> après connexion à votre Espace Client.
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateAccount}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-md shadow transition-colors shrink-0 cursor-pointer"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Se connecter (Espace Client)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200 text-xs">
              <div className="p-4 bg-[#FAF8F5] rounded-lg border border-stone-200 space-y-1">
                <strong className="text-[#2B1810] block">Lecture littérale indexée</strong>
                <p className="text-stone-600">
                  Recherche en temps réel dans les passages des 12 ouvrages avec citation du titre, du tome et du numéro de page.
                </p>
              </div>
              <div className="p-4 bg-[#FAF8F5] rounded-lg border border-stone-200 space-y-1">
                <strong className="text-[#2B1810] block">Thèse & contrepoint loyal</strong>
                <p className="text-stone-600">
                  Expose fidèlement la démonstration d'Émile Mourey tout en signalant l'écart éventuel avec le consensus académique.
                </p>
              </div>
              <div className="p-4 bg-[#FAF8F5] rounded-lg border border-stone-200 space-y-1">
                <strong className="text-[#2B1810] block">Passerelle vers les livres</strong>
                <p className="text-stone-600">
                  Chaque réponse inclut des liens cliquables vers les ouvrages cités pour ouvrir leurs extraits ou leur fiche Kindle.
                </p>
              </div>
            </div>
          </div>
        ) : isCheckingSub ? (
          <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#8B1E2D]" />
            <span>Vérification de votre abonnement IA...</span>
          </div>
        ) : !isSubscribed ? (
          /* ÉTAPE 2 : Connecté mais pas encore abonné -> Carte d'activation Abonnement Offert (Phase de test) */
          <div className="bg-white border-2 border-[#D4AF37]/60 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Offre Phase de Test · 0,00 €
                  </span>
                  {customerEmail && (
                    <span className="text-[11px] text-stone-500 font-mono">
                      Compte : {customerEmail}
                    </span>
                  )}
                </div>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1810]">
                  Pass Lecteur — Assistant IA Émile Mourey
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  L'accès à l'assistant documentaire sur les 12 ouvrages est normalement soumis à abonnement. Pour cette phase de test, <strong>l'abonnement vous est offert gratuitement</strong> sans carte bancaire requise.
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-5 text-center space-y-3 shrink-0 min-w-[230px]">
                <div>
                  <span className="text-xs text-stone-400 line-through block">9,90 € / mois</span>
                  <span className="font-serif-display text-3xl font-bold text-emerald-700">
                    Offert
                  </span>
                  <span className="text-[11px] text-stone-500 block">Phase de test ouverte</span>
                </div>
                <button
                  type="button"
                  disabled={isActivating}
                  onClick={() => void handleActivateFreeBeta()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8B1E2D] hover:bg-[#721824] disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {isActivating
                      ? 'Activation en cours...'
                      : 'Activer mon abonnement offert'}
                  </span>
                </button>
              </div>
            </div>

            {subError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{subError}</span>
              </div>
            )}
          </div>
        ) : (
          /* ÉTAPE 3 : Abonné actif -> Interface de Chat IA temps réel */
          <div className="space-y-5">
            {/* Barre de statut abonnement & filtre d'ouvrage */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Abonnement actif ({subPlan === 'beta_free' ? 'Phase de test — Offert' : subPlan})
                  </span>
                </span>
                {geminiConfigured === false && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Secret GEMINI_API_KEY à configurer sur le Worker</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="ai-book-scope" className="text-stone-600 font-medium whitespace-nowrap">
                  Périmètre :
                </label>
                <select
                  id="ai-book-scope"
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF8F5] border border-stone-300 rounded-md text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#8B1E2D] max-w-xs"
                >
                  <option value="">Toute la collection (12 ouvrages)</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                      {b.tome ? ` (${b.tome})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Zone de conversation */}
            <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-5 sm:p-6 min-h-[340px] max-h-[560px] overflow-y-auto space-y-5 bg-[#FAF8F5]/50">
                {messages.length === 0 ? (
                  <div className="space-y-5 py-4">
                    <div className="text-center space-y-1.5 max-w-xl mx-auto">
                      <Sparkles className="w-8 h-8 text-[#8B1E2D] mx-auto" />
                      <h3 className="font-serif-display text-xl font-bold text-[#2B1810]">
                        Que souhaitez-vous vérifier dans les ouvrages d’Émile Mourey ?
                      </h3>
                      <p className="text-xs text-stone-600">
                        L'IA analyse les textes indexés et présente la position de l'auteur avec les références des tomes concernés.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SUGGESTED_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => void handleAsk(q)}
                          className="text-left p-3.5 bg-white hover:bg-[#F5F1E9] border border-stone-200 hover:border-[#8B1E2D]/50 rounded-lg text-xs text-stone-700 leading-snug transition-colors cursor-pointer shadow-2xs"
                        >
                          <span className="text-[#8B1E2D] font-bold mr-1.5">→</span>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-3xl rounded-xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-3 ${
                          msg.role === 'user'
                            ? 'bg-[#2B1810] text-stone-100'
                            : 'bg-white border border-stone-200 text-stone-800 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-wider opacity-75">
                          <span className="font-bold">
                            {msg.role === 'user'
                              ? 'Votre question'
                              : 'Assistant Documentaire · Éditions Émile Mourey'}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {msg.role === 'model' ? (
                          <FormattedAiText text={msg.text} />
                        ) : (
                          <div className="whitespace-pre-line">{msg.text}</div>
                        )}

                        {msg.role === 'model' && msg.references && msg.references.length > 0 && (
                          <div className="pt-3 border-t border-stone-100 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                              <span className="font-semibold text-stone-700 flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-[#8B1E2D]" />
                                Ouvrages & références cités :
                              </span>
                              <span className="font-mono text-[10px] bg-stone-100 px-2 py-0.5 rounded">
                                {msg.mode === 'd1_literal'
                                  ? `Index littéral D1 (${msg.indexedChunksUsed} passages)`
                                  : 'Synthèse catalogue & dossiers'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {msg.references.map((ref, idx) => {
                                const bookObj = books.find((b) => b.id === ref.bookId);
                                return (
                                  <button
                                    key={`${ref.bookId}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                      if (bookObj) onSelectBook(bookObj);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#8B1E2D] hover:text-white text-[#2B1810] border border-stone-300 hover:border-[#8B1E2D] rounded text-[11px] font-medium transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-3 h-3 shrink-0" />
                                    <span>
                                      {ref.title}
                                      {ref.tome ? ` (${ref.tome})` : ''}
                                      {ref.pages && ref.pages.length > 0
                                        ? ` · p. ${ref.pages.sort((a, b) => a - b).join(', ')}`
                                        : ''}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {isAsking && (
                  <div className="flex items-center gap-2 text-xs text-stone-600 bg-white border border-stone-200 rounded-lg px-4 py-3 w-fit shadow-2xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#8B1E2D]" />
                    <span>Recherche dans les ouvrages d’Émile Mourey et rédaction en cours...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {askError && (
                <div className="mx-5 my-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{askError}</span>
                </div>
              )}

              {/* Formulaire de question */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleAsk();
                }}
                className="p-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row gap-2.5"
              >
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  maxLength={1000}
                  placeholder="Posez une question sur Bibracte, Alésia, Gergovie, le judéo-druidisme, le Christ, Mahomet..."
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B1E2D] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={isAsking || !questionInput.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8B1E2D] hover:bg-[#721824] disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Interroger l'IA</span>
                </button>
              </form>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 px-1">
              <span>
                Réponses générées par Google Gemini à partir du corpus d'Émile Mourey. Vérifiez toujours les citations dans l'ouvrage original.
              </span>
              <button
                type="button"
                onClick={onNavigateMethod}
                className="inline-flex items-center gap-1 text-[#8B1E2D] font-semibold hover:underline cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Voir Méthode & Controverse</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

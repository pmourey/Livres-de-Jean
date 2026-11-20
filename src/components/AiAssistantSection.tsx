import React, { useEffect, useRef, useState } from 'react';
import { Book } from '../types';
import { STUDY_DOSSIERS } from '../data/studyDossiers';
import { AGORAVOX_AUTHOR_PROFILES } from '../data/agoravoxAuthorProfiles';
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
  Loader2,
  ExternalLink,
  MessageSquare,
  Plus,
  History,
  Share2,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';

interface AiReference {
  bookId: string;
  title: string;
  tome?: string;
  pages?: number[];
}

interface AgoraVoxReference {
  sourceType: 'article' | 'comment';
  title: string;
  authorName: string;
  publishedDate?: string;
  url: string;
}

interface AcademicReference {
  docType: string;
  title: string;
  authors: string;
  year?: string;
  journal?: string;
  url: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  references?: AiReference[];
  agoravoxReferences?: AgoraVoxReference[];
  academicReferences?: AcademicReference[];
  mode?: 'd1_literal' | 'catalog_synthesis';
  indexedChunksUsed?: number;
  indexedAgoravoxUsed?: number;
  indexedAcademicUsed?: number;
  model?: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  scope: string;
  updatedAt: string;
  messages: ChatMessage[];
  shareUrl?: string;
}

interface AiAssistantSectionProps {
  books: Book[];
  customerToken: string;
  customerEmail?: string;
  sharedSessionId?: string | null;
  onExitSharedSession?: () => void;
  onSelectBook: (book: Book) => void;
  onNavigateAccount: () => void;
  onNavigateMethod: () => void;
}

const SESSIONS_STORAGE_KEY = 'emile_mourey_ai_sessions_v1';

const FOLLOW_UP_PROMPTS = [
  'Peux-tu approfondir avec des citations littérales et numéros de pages précis ?',
  'Quelles sont les principales objections archéologiques ou universitaires sur ce point ?',
  "Qu'en disent les lecteurs et les réponses d'Émile Mourey dans les commentaires AgoraVox ?"
];

const SUGGESTED_QUESTIONS = [
  "Où Émile Mourey situe-t-il Bibracte et quel rôle stratégique attribue-t-il au mont Beuvray ?",
  "Que signifie « altero die » dans sa relecture d'Alésia et pourquoi déplace-t-il l'assaut sur la montagne de Bussy ?",
  "Quelle est sa thèse sur le judéo-druidisme et les sculptures romanes de Chalon-sur-Saône et Vézelay ?",
  "Comment Émile Mourey interprète-t-il les figures prophétiques et les « épouses » dans Histoire de Mahomet ?"
];

/**
 * Rendu éditorial propre du Markdown renvoyé par Gemini (titres, citations, listes,
 * liens cliquables [label](url), gras, italique et séparateurs) sans dépendance externe.
 */
const renderInlineFormatting = (
  text: string,
  agoravoxReferences?: AgoraVoxReference[]
): React.ReactNode[] => {
  // Normalize malformed italic-link combinations like *[label](url)* or [*label*](url)
  const normalizedText = text
    .replace(/\*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\*/g, '[$1]($2)')
    .replace(/\[\*+([^\]]+?)\*+\]\((https?:\/\/[^)\s]+)\)/g, '[$1]($2)');

  const nodes: React.ReactNode[] = [];
  const regex = /(\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\[AGORAVOX\s+(\d+)(?:[^\]]*)\]|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = regex.exec(normalizedText)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(normalizedText.slice(lastIndex, match.index));
    }
    const token = match[0];

    // Markdown link: [label](https://...)
    const mdLinkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (mdLinkMatch) {
      const [, rawLabel, rawHref] = mdLinkMatch;
      const href = rawHref.replace(/^http:\/\/(www\.)?agoravox\.fr/i, 'https://www.agoravox.fr');
      const isItalic = rawLabel.startsWith('*') && rawLabel.endsWith('*') && !rawLabel.startsWith('**');
      const cleanLabel = rawLabel.replace(/\*/g, '').trim();
      const isBookMislinkedToWeb =
        /(agoravox\.fr|hal\.science|persee\.fr)/i.test(href) &&
        /\b(p\.\s*\d+|page\s+\d+|Tome\s+\d+|1ère\s+partie|2ème\s+partie|La Gaule en héritage|Histoire de Bibracte|Alésia|Gergovie|Uxellodunum|Bourgogne romane|Histoire du Christ|Histoire de Mahomet)\b/i.test(
          cleanLabel
        ) &&
        !/\b(agoravox|commentaire|article|forum|gallia|hal|cnrs|reddé|guichard|goudineau|deberge)\b/i.test(
          cleanLabel
        );

      if (isBookMislinkedToWeb) {
        // Render printed book citation cleanly in italic without the mismatched web URL
        nodes.push(
          <em key={`bk-${keyIdx++}`} className="italic font-medium text-[#2B1810]">
            {cleanLabel}
          </em>
        );
      } else {
        nodes.push(
          <a
            key={`a-${keyIdx++}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-0.5 text-[#8B1E2D] hover:text-[#65131E] underline decoration-[#8B1E2D]/50 underline-offset-2 font-medium ${
              isItalic ? 'italic' : ''
            }`}
          >
            <span>{cleanLabel}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      }
    } else if (match[2]) {
      // Safety net: convert leftover [AGORAVOX N ...] into a real clickable link
      const refIdx = Number(match[2]) - 1;
      const ref = agoravoxReferences?.[refIdx];
      if (ref?.url) {
        nodes.push(
          <a
            key={`av-${keyIdx++}`}
            href={ref.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-[#8B1E2D] hover:text-[#65131E] underline decoration-[#8B1E2D]/50 underline-offset-2 font-medium"
          >
            <span>
              {ref.sourceType === 'comment'
                ? `Commentaire (${ref.authorName}) — ${ref.title}`
                : ref.title}
            </span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      const authorProfileUrl = AGORAVOX_AUTHOR_PROFILES[boldText.trim()];
      if (authorProfileUrl && boldText.trim().toLowerCase() !== 'emile mourey') {
        nodes.push(
          <a
            key={`ap-${keyIdx++}`}
            href={authorProfileUrl}
            target="_blank"
            rel="noreferrer"
            title={`Voir le profil AgoraVox de ${boldText.trim()}`}
            className="inline-flex items-center gap-0.5 font-semibold text-[#8B1E2D] hover:text-[#65131E] underline decoration-[#8B1E2D]/50 underline-offset-2"
          >
            <span>{boldText}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      } else {
        nodes.push(
          <strong key={`b-${keyIdx++}`} className="font-semibold text-[#2B1810]">
            {boldText}
          </strong>
        );
      }
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={`i-${keyIdx++}`} className="italic text-stone-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < normalizedText.length) {
    nodes.push(normalizedText.slice(lastIndex));
  }
  return nodes;
};

const FormattedAiText: React.FC<{
  text: string;
  agoravoxReferences?: AgoraVoxReference[];
}> = ({ text, agoravoxReferences }) => {
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
            <span>{renderInlineFormatting(item, agoravoxReferences)}</span>
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
        {renderInlineFormatting(quoteLines.join(' '), agoravoxReferences)}
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

    if (/^[-*_]{3,}$/.test(line)) {
      flushList();
      flushQuote();
      elements.push(<hr key={`hr-${blockKey++}`} className="border-stone-200 my-3" />);
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
          {renderInlineFormatting(headingText, agoravoxReferences)}
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
        {renderInlineFormatting(line, agoravoxReferences)}
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
  sharedSessionId = null,
  onExitSharedSession,
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
  const [indexedAgoravoxCount, setIndexedAgoravoxCount] = useState<number>(0);
  const [indexedAcademicCount, setIndexedAcademicCount] = useState<number>(0);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  // Multi-session persistent history (per question / topic)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages: ChatMessage[] = activeSession?.messages || [];

  const [selectedScope, setSelectedScope] = useState<string>(activeSession?.scope || 'all');
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  // Share state
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  // Public shared read-only session state
  const [sharedViewData, setSharedViewData] = useState<{
    id: string;
    title: string;
    scope: string;
    createdAt: string;
    messages: ChatMessage[];
  } | null>(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [sharedLoadError, setSharedLoadError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions.slice(0, 30)));
    } catch {
      // ignore quota errors
    }
  }, [sessions]);

  // Load shared public session when URL is #/ai/share/:id
  useEffect(() => {
    if (!sharedSessionId) {
      setSharedViewData(null);
      setSharedLoadError(null);
      return;
    }
    setIsLoadingShared(true);
    setSharedLoadError(null);
    fetch(`${PAYMENTS_API_BASE}/api/ai/sessions/share/${encodeURIComponent(sharedSessionId)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.session) {
          throw new Error(data?.error || 'Session partagée introuvable.');
        }
        setSharedViewData(data.session);
      })
      .catch((err: any) => {
        setSharedLoadError(err?.message || 'Impossible de charger cette session partagée.');
      })
      .finally(() => {
        setIsLoadingShared(false);
      });
  }, [sharedSessionId]);

  const handleNewSession = () => {
    setActiveSessionId(null);
    setAskError(null);
    setShareError(null);
    setCopiedShareUrl(false);
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setSelectedScope(session.scope || 'all');
    setAskError(null);
    setShareError(null);
    setCopiedShareUrl(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const handleShareSession = async () => {
    if (!activeSession || activeSession.messages.length === 0 || isSharing) return;
    setIsSharing(true);
    setShareError(null);
    setCopiedShareUrl(false);
    try {
      const res = await fetch(`${PAYMENTS_API_BASE}/api/ai/sessions/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`
        },
        body: JSON.stringify({
          title: activeSession.title,
          scope: activeSession.scope,
          messages: activeSession.messages
        })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.shareUrl) {
        throw new Error(data?.error || 'Impossible de générer le lien de partage.');
      }
      const shareUrl = String(data.shareUrl);
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? { ...s, shareUrl } : s))
      );
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedShareUrl(true);
        setTimeout(() => setCopiedShareUrl(false), 4000);
      } catch {
        // clipboard may be blocked; URL is displayed visibly below
      }
    } catch (err: any) {
      setShareError(err?.message || 'Erreur lors du partage de la session.');
    } finally {
      setIsSharing(false);
    }
  };

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
          setIndexedAgoravoxCount(Number(data?.indexedAgoravoxCount || 0));
          setIndexedAcademicCount(Number(data?.indexedAcademicCount || 0));
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
    const isSpecificBook =
      selectedScope !== 'all' &&
      selectedScope !== 'books' &&
      selectedScope !== 'agoravox' &&
      selectedScope !== 'academic';
    const targetBooks = isSpecificBook
      ? books.filter((b) => b.id === selectedScope)
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
      .slice(0, isSpecificBook ? 1 : 6);

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
    setShareError(null);
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: nowTime
    };

    const currentHistory = messages.slice(-10).map((m) => ({ role: m.role, text: m.text }));
    let targetSessionId = activeSessionId;

    if (!targetSessionId || !sessions.some((s) => s.id === targetSessionId)) {
      targetSessionId = `sess-${Date.now()}`;
      const newSession: ChatSession = {
        id: targetSessionId,
        title: q.length > 72 ? `${q.slice(0, 70)}…` : q,
        scope: selectedScope,
        updatedAt: nowIso,
        messages: [userMsg]
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(targetSessionId);
    } else {
      const sid = targetSessionId;
      setSessions((prev) =>
        prev
          .map((s) =>
            s.id === sid
              ? {
                  ...s,
                  scope: selectedScope,
                  updatedAt: nowIso,
                  shareUrl: undefined, // invalidate old snapshot if conversation continues
                  messages: [...s.messages, userMsg]
                }
              : s
          )
          .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
      );
    }

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
          sourceScope:
            selectedScope === 'all' ||
            selectedScope === 'books' ||
            selectedScope === 'agoravox' ||
            selectedScope === 'academic'
              ? selectedScope
              : 'books',
          bookId:
            selectedScope !== 'all' &&
            selectedScope !== 'books' &&
            selectedScope !== 'agoravox' &&
            selectedScope !== 'academic'
              ? selectedScope
              : undefined,
          history: currentHistory,
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
        agoravoxReferences: Array.isArray(data.agoravoxReferences) ? data.agoravoxReferences : [],
        academicReferences: Array.isArray(data.academicReferences) ? data.academicReferences : [],
        mode: data.mode,
        indexedChunksUsed: data.indexedChunksUsed,
        indexedAgoravoxUsed: data.indexedAgoravoxUsed,
        indexedAcademicUsed: data.indexedAcademicUsed,
        model: data.model,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      const sid = targetSessionId;
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sid
            ? { ...s, updatedAt: new Date().toISOString(), messages: [...s.messages, aiMsg] }
            : s
        )
      );
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
                {indexedChunksCount > 0 || indexedAgoravoxCount > 0 || indexedAcademicCount > 0
                  ? `${indexedChunksCount.toLocaleString('fr-FR')} passages PDF + ${indexedAgoravoxCount.toLocaleString('fr-FR')} extraits AgoraVox + ${indexedAcademicCount.toLocaleString('fr-FR')} publications scientifiques (CNRS/HAL/Gallia)`
                  : 'Mode RAG prêt (Ouvrages + AgoraVox + Publications scientifiques CNRS/HAL)'}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Clé API sécurisée côté Cloudflare Worker</span>
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* VUE PUBLIQUE EN LECTURE SEULE : Session partagée (#/ai/share/:id) */}
        {sharedSessionId ? (
          <div className="space-y-5">
            <div className="bg-[#F5F1E9] border border-stone-300 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-cinzel uppercase tracking-wider font-bold text-[#8B1E2D]">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Session Assistant IA partagée · Lecture seule</span>
                </span>
                <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2B1810]">
                  {sharedViewData?.title || 'Chargement de la session partagée...'}
                </h2>
                {sharedViewData?.createdAt && (
                  <p className="text-[11px] text-stone-500">
                    Instantané partagé le {sharedViewData.createdAt}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onExitSharedSession?.()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Poser ma propre question</span>
              </button>
            </div>

            {isLoadingShared ? (
              <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#8B1E2D]" />
                <span>Chargement de la conversation partagée...</span>
              </div>
            ) : sharedLoadError ? (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{sharedLoadError}</span>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5 bg-[#FAF8F5]/50">
                {(sharedViewData?.messages || []).map((msg) => (
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
                            ? 'Question posée'
                            : 'Assistant Documentaire · Éditions Émile Mourey'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      {msg.role === 'model' ? (
                        <FormattedAiText
                          text={msg.text}
                          agoravoxReferences={msg.agoravoxReferences}
                        />
                      ) : (
                        <div className="whitespace-pre-line">{msg.text}</div>
                      )}

                      {msg.role === 'model' &&
                        ((msg.references && msg.references.length > 0) ||
                          (msg.agoravoxReferences && msg.agoravoxReferences.length > 0) ||
                          (msg.academicReferences && msg.academicReferences.length > 0)) && (
                          <div className="pt-3 border-t border-stone-100 space-y-2">
                            {msg.references && msg.references.length > 0 && (
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
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#8B1E2D] hover:text-white text-[#2B1810] border border-stone-300 rounded text-[11px] font-medium transition-colors cursor-pointer"
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
                            )}
                            {msg.agoravoxReferences && msg.agoravoxReferences.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {msg.agoravoxReferences.map((av, idx) => (
                                  <a
                                    key={`${av.url}-${idx}`}
                                    href={av.url.replace(/^http:\/\/(www\.)?agoravox\.fr/i, 'https://www.agoravox.fr')}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded text-[11px] font-medium"
                                  >
                                    <MessageSquare className="w-3 h-3 shrink-0 text-[#8B1E2D]" />
                                    <span className="max-w-[260px] truncate">
                                      {av.sourceType === 'comment'
                                        ? `Commentaire (${av.authorName}) — ${av.title}`
                                        : `AgoraVox — ${av.title}`}
                                    </span>
                                    <ExternalLink className="w-3 h-3 shrink-0 text-amber-700" />
                                  </a>
                                ))}
                              </div>
                            )}
                            {msg.academicReferences && msg.academicReferences.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {msg.academicReferences.map((ac, idx) => (
                                  <a
                                    key={`${ac.url}-${idx}`}
                                    href={ac.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded text-[11px] font-medium transition-colors"
                                    title={`${ac.title} — ${ac.authors}${ac.year ? ` (${ac.year})` : ''}`}
                                  >
                                    <GraduationCap className="w-3 h-3 shrink-0 text-emerald-800" />
                                    <span className="max-w-[280px] truncate">
                                      [{ac.docType}] {ac.title}
                                      {ac.year ? ` (${ac.year})` : ''}
                                    </span>
                                    <ExternalLink className="w-3 h-3 shrink-0 text-emerald-700" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !isAuthenticated ? (
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
          /* ÉTAPE 3 : Abonné actif -> Historique multi-sessions + Chat IA temps réel + Partage */
          <div className="space-y-5">
            {/* Barre de statut abonnement, actions session & filtre de périmètre */}
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
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

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label htmlFor="ai-book-scope" className="text-stone-600 font-medium whitespace-nowrap">
                  Périmètre :
                </label>
                <select
                  id="ai-book-scope"
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF8F5] border border-stone-300 rounded-md text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#8B1E2D] max-w-xs"
                >
                  <option value="all">Toute la base (Ouvrages + AgoraVox + CNRS/HAL)</option>
                  <option value="books">Uniquement les ouvrages d'Émile Mourey</option>
                  <option value="agoravox">Uniquement AgoraVox (articles & commentaires)</option>
                  <option value="academic">Uniquement les publications scientifiques (CNRS / HAL / Gallia)</option>
                  <optgroup label="Filtrer par ouvrage">
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                        {b.tome ? ` (${b.tome})` : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>

                {activeSession && activeSession.messages.length > 0 && (
                  <button
                    type="button"
                    disabled={isSharing}
                    onClick={() => void handleShareSession()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-amber-300 font-semibold rounded-md transition-colors cursor-pointer"
                    title="Créer un lien public en lecture seule pour partager cette conversation"
                  >
                    {copiedShareUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Lien copié !</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{isSharing ? 'Partage...' : 'Partager la session'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Bandeau lien de partage généré */}
            {activeSession?.shareUrl && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Share2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold shrink-0">Lien de partage (lecture seule) :</span>
                  <a
                    href={activeSession.shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] text-emerald-900 underline truncate"
                  >
                    {activeSession.shareUrl}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(activeSession.shareUrl!);
                    setCopiedShareUrl(true);
                    setTimeout(() => setCopiedShareUrl(false), 3000);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded font-semibold shrink-0 cursor-pointer"
                >
                  {copiedShareUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedShareUrl ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            )}

            {shareError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{shareError}</span>
              </div>
            )}

            {/* Grille 2 colonnes : Historique des sessions (gauche) + Conversation active (droite) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Colonne Historique des sessions */}
              <aside className="lg:col-span-3 bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <span className="text-xs font-bold text-[#2B1810] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#8B1E2D]" />
                    <span>Sessions ({sessions.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleNewSession}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#8B1E2D] hover:bg-[#721824] text-white text-[11px] font-semibold rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nouvelle</span>
                  </button>
                </div>

                {sessions.length === 0 ? (
                  <p className="text-[11px] text-stone-500 py-3 text-center leading-relaxed">
                    Vos sessions de recherche s'enregistreront ici pour vous permettre de les reprendre et les approfondir.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-0.5">
                    {sessions.map((sess) => {
                      const isCurrent = sess.id === activeSessionId;
                      return (
                        <div
                          key={sess.id}
                          onClick={() => handleSelectSession(sess)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handleSelectSession(sess);
                          }}
                          className={`group p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                            isCurrent
                              ? 'bg-[#FAF8F5] border-[#8B1E2D] shadow-2xs'
                              : 'bg-white border-stone-200/80 hover:bg-stone-50'
                          }`}
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="text-xs font-semibold text-[#2B1810] line-clamp-2 leading-snug">
                              {sess.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-stone-500">
                              <span>{sess.messages.length} éch.</span>
                              {sess.shareUrl && (
                                <span className="text-emerald-700 font-medium">· Partagée</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(sess.id, e)}
                            title="Supprimer cette session"
                            className="p-1 text-stone-400 hover:text-rose-700 opacity-60 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </aside>

              {/* Colonne Conversation active */}
              <div className="lg:col-span-9 bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
                <div className="p-5 sm:p-6 min-h-[360px] max-h-[600px] overflow-y-auto space-y-5 bg-[#FAF8F5]/50">
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
                          <FormattedAiText
                            text={msg.text}
                            agoravoxReferences={msg.agoravoxReferences}
                          />
                        ) : (
                          <div className="whitespace-pre-line">{msg.text}</div>
                        )}

                        {msg.role === 'model' &&
                          ((msg.references && msg.references.length > 0) ||
                            (msg.agoravoxReferences && msg.agoravoxReferences.length > 0) ||
                            (msg.academicReferences && msg.academicReferences.length > 0)) && (
                            <div className="pt-3 border-t border-stone-100 space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                                <span className="font-semibold text-stone-700 flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5 text-[#8B1E2D]" />
                                  Sources & références consultées :
                                </span>
                                <span className="font-mono text-[10px] bg-stone-100 px-2 py-0.5 rounded">
                                  {msg.mode === 'd1_literal'
                                    ? `${msg.indexedChunksUsed || 0} liv. · ${msg.indexedAgoravoxUsed || 0} AgoraVox · ${msg.indexedAcademicUsed || 0} CNRS/HAL`
                                    : 'Synthèse catalogue & dossiers'}
                                </span>
                              </div>

                              {msg.references && msg.references.length > 0 && (
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
                              )}

                              {msg.agoravoxReferences && msg.agoravoxReferences.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-0.5">
                                  {msg.agoravoxReferences.map((av, idx) => (
                                    <a
                                      key={`${av.url}-${idx}`}
                                      href={av.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded text-[11px] font-medium transition-colors"
                                      title={av.url}
                                    >
                                      <MessageSquare className="w-3 h-3 shrink-0 text-[#8B1E2D]" />
                                      <span className="max-w-[260px] truncate">
                                        {av.sourceType === 'comment'
                                          ? `Commentaire (${av.authorName}) — ${av.title}`
                                          : `AgoraVox — ${av.title}`}
                                      </span>
                                      <ExternalLink className="w-3 h-3 shrink-0 text-amber-700" />
                                    </a>
                                  ))}
                                </div>
                              )}

                              {msg.academicReferences && msg.academicReferences.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-0.5">
                                  {msg.academicReferences.map((ac, idx) => (
                                    <a
                                      key={`${ac.url}-${idx}`}
                                      href={ac.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded text-[11px] font-medium transition-colors"
                                      title={`${ac.title} — ${ac.authors}${ac.year ? ` (${ac.year})` : ''}${ac.journal ? ` · ${ac.journal}` : ''}`}
                                    >
                                      <GraduationCap className="w-3 h-3 shrink-0 text-emerald-800" />
                                      <span className="max-w-[290px] truncate">
                                        [{ac.docType}] {ac.title}
                                        {ac.year ? ` (${ac.year})` : ''}
                                      </span>
                                      <ExternalLink className="w-3 h-3 shrink-0 text-emerald-700" />
                                    </a>
                                  ))}
                                </div>
                              )}
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

              {/* Suggestions d'approfondissement rapide quand une session est active */}
              {messages.length > 0 && !isAsking && (
                <div className="px-4 py-2.5 bg-[#FAF8F5] border-t border-stone-200/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mr-1">
                    Approfondir :
                  </span>
                  {FOLLOW_UP_PROMPTS.map((fp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => void handleAsk(fp)}
                      className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#F5F1E9] text-stone-700 hover:text-[#8B1E2D] border border-stone-200 hover:border-[#8B1E2D]/40 rounded-full transition-colors cursor-pointer"
                    >
                      {fp}
                    </button>
                  ))}
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
                  placeholder={
                    messages.length > 0
                      ? 'Approfondissez votre question dans cette session...'
                      : 'Posez une question sur Bibracte, Alésia, Gergovie, le judéo-druidisme, le Christ, Mahomet...'
                  }
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B1E2D] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={isAsking || !questionInput.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8B1E2D] hover:bg-[#721824] disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{messages.length > 0 ? 'Approfondir' : "Interroger l'IA"}</span>
                </button>
              </form>
              </div>
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

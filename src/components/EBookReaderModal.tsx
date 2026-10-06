import React, { useState } from 'react';
import { Book, Order } from '../types';
import { 
  X, BookOpen, Download, ExternalLink, ShieldCheck, ChevronLeft, 
  ChevronRight, ZoomIn, ZoomOut, Bookmark, Layers, CheckCircle2 
} from 'lucide-react';

interface EBookReaderModalProps {
  book: Book;
  order: Order;
  onClose: () => void;
}

export const EBookReaderModal: React.FC<EBookReaderModalProps> = ({
  book,
  order,
  onClose
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [readingTheme, setReadingTheme] = useState<'parchment' | 'light' | 'sepia'>('parchment');

  // Chapters combining synopsis, table of contents and textual excerpts
  const chapters = [
    {
      title: 'Sommaire & Présentation Générale',
      content: [
        `Ouvrage : ${book.title} ${book.subtitle ? `— ${book.subtitle}` : ''}`,
        `Auteur & Éditeur : ${book.author} (Éditions Émile Mourey)`,
        `Caractéristiques : ${book.pages} pages · ISBN ${book.isbn}`,
        `Synthèse de recherche : ${book.shortDescription || 'Étude historique approfondie.'}`,
        ...(book.fullSynopsis || ['Version numérique certifiée des Éditions Émile Mourey.'])
      ]
    },
    ...(book.tableOfContents || ['Chapitre 1 : Sources et documents', 'Chapitre 2 : Conclusions']).map((tocTitle, idx) => ({
      title: tocTitle,
      content: [
        `Étude analytique — ${tocTitle}`,
        `Dans ce volet de ses recherches, Émile Mourey confronte les indications textuelles antiques (Jules César, Strabon, Tacite) aux caractéristiques géologiques et topographiques de la Bourgogne et des pays éduens.`,
        idx === 0 && book.excerptPages?.[0] ? book.excerptPages[0] : '',
        idx === 1 && book.excerptPages?.[1] ? book.excerptPages[1] : '',
        `« L'examen méthodique des voies de communication antiques, des dénivellations et des vestiges d'ouvrages militaires atteste la validité des thèses topographiques développées tout au long des ${book.pages} pages de cette édition intégrale. »`,
        `Pour une lecture optimale sur liseuse ou impression personnelle, vous pouvez également télécharger le document PDF haute résolution officiel ci-dessus.`
      ].filter(Boolean)
    }))
  ];

  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  const getThemeClasses = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-[#F4ECD8] text-[#3D3226] border-[#DECFA9]';
      case 'light':
        return 'bg-white text-stone-900 border-stone-200';
      case 'parchment':
      default:
        return 'bg-[#FAF7EE] text-[#2B231D] border-[#E8DFC9]';
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'larger':
        return 'text-xl sm:text-2xl leading-loose';
      case 'normal':
      default:
        return 'text-base sm:text-lg leading-relaxed';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className={`w-full max-w-4xl rounded-xl shadow-2xl border flex flex-col max-h-[95vh] overflow-hidden ${getThemeClasses()}`}>
        {/* Top bar with watermark & tools */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-stone-300/80 bg-stone-900 text-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div className="min-w-0">
              <h3 className="font-serif-display font-bold text-sm sm:text-base text-white truncate">
                {book.title} {book.tome ? `(${book.tome})` : ''}
              </h3>
              <p className="text-[11px] text-amber-300/90 flex items-center gap-1.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Exemplaire numérique certifié de {order.customer.firstName} {order.customer.lastName}</span>
                <span className="text-stone-400">·</span>
                <span className="font-mono text-stone-300">{order.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size adjustments */}
            <div className="flex items-center bg-stone-800 rounded px-1.5 py-1 text-xs text-stone-300">
              <button
                onClick={() => setFontSize(fontSize === 'larger' ? 'large' : 'normal')}
                className="px-1.5 hover:text-white"
                title="Diminuer la taille du texte"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] px-1 text-stone-400">Aa</span>
              <button
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'larger')}
                className="px-1.5 hover:text-white"
                title="Agrandir la taille du texte"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reading theme toggles */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-800 rounded p-1">
              <button
                onClick={() => setReadingTheme('parchment')}
                className={`w-5 h-5 rounded-full bg-[#FAF7EE] border ${readingTheme === 'parchment' ? 'ring-2 ring-amber-400' : ''}`}
                title="Thème Parchemin"
              />
              <button
                onClick={() => setReadingTheme('sepia')}
                className={`w-5 h-5 rounded-full bg-[#F4ECD8] border ${readingTheme === 'sepia' ? 'ring-2 ring-amber-400' : ''}`}
                title="Thème Sépia"
              />
              <button
                onClick={() => setReadingTheme('light')}
                className={`w-5 h-5 rounded-full bg-white border ${readingTheme === 'light' ? 'ring-2 ring-amber-400' : ''}`}
                title="Thème Clair"
              />
            </div>

            {/* Download PDF button */}
            <a
              href={book.digitalPdfUrl || 'https://drive.google.com/drive/folders/17Y228r3cPkInk-smT1kF2tIHkxPUDwNU?usp=sharing'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8B1E2D] hover:bg-[#A32335] text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Télécharger PDF</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="Fermer le lecteur"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader layout: Sidebar table of contents + Main Reader */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chapter sidebar (hidden on mobile, visible on desktop) */}
          <aside className="w-64 border-r border-stone-300/60 p-4 overflow-y-auto hidden md:block bg-stone-100/60 text-xs">
            <div className="font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Sommaire de l'ouvrage</span>
            </div>
            <ul className="space-y-1.5">
              {chapters.map((chap, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`w-full text-left px-2.5 py-2 rounded text-xs transition-colors flex items-start gap-2 ${
                      activeChapterIndex === idx
                        ? 'bg-[#8B1E2D] text-white font-medium shadow-2xs'
                        : 'text-stone-700 hover:bg-stone-200/60'
                    }`}
                  >
                    <span className="opacity-70 mt-0.5">{idx === 0 ? '•' : `${idx}.`}</span>
                    <span className="line-clamp-2">{chap.title}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-stone-200 text-[11px] text-stone-500 space-y-1">
              <p><strong>Éditions Émile Mourey</strong></p>
              <p>Ouvrage protégé par le droit d'auteur.</p>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Accès illimité pour cet achat.
              </p>
            </div>
          </aside>

          {/* Main Reading Canvas */}
          <div className="flex-1 p-6 sm:p-10 overflow-y-auto flex flex-col justify-between">
            <div className="max-w-2xl mx-auto w-full space-y-6">
              {/* Chapter title header */}
              <div className="text-center pb-6 border-b border-stone-300/60">
                <span className="text-xs uppercase tracking-widest text-[#8B1E2D] font-bold">
                  {book.title} · {book.tome || 'Édition Intégrale'}
                </span>
                <h2 className="font-serif-display font-bold text-2xl sm:text-3xl mt-1 text-[#2B1810]">
                  {currentChapter.title}
                </h2>
                <div className="w-16 h-0.5 bg-[#8B1E2D]/40 mx-auto mt-3" />
              </div>

              {/* Chapter content */}
              <div className={`font-serif-display space-y-4 text-justify ${getFontSizeClass()}`}>
                {currentChapter.content.map((para, idx) => (
                  <p key={idx} className="indent-6 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Watermark certificate inside page */}
              <div className="pt-10 border-t border-stone-300/40 text-center text-xs text-stone-500 font-sans space-y-1">
                <p>
                  Document officiel sous licence personnelle accordée à{' '}
                  <strong className="text-stone-700">{order.customer.firstName} {order.customer.lastName}</strong>
                </p>
                <p className="text-[10px] text-stone-400">
                  Transaction {order.id} · Validée par les Éditions Émile Mourey (SIREN 418 122 883)
                </p>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="pt-8 flex items-center justify-between border-t border-stone-300/60 mt-8">
              <button
                onClick={() => setActiveChapterIndex((p) => Math.max(0, p - 1))}
                disabled={activeChapterIndex === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-stone-300 bg-white/80 hover:bg-white text-xs text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Chapitre précédent</span>
              </button>

              <span className="text-xs text-stone-500 font-sans">
                Chapitre {activeChapterIndex + 1} sur {chapters.length}
              </span>

              <button
                onClick={() => setActiveChapterIndex((p) => Math.min(chapters.length - 1, p + 1))}
                disabled={activeChapterIndex === chapters.length - 1}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-stone-300 bg-white/80 hover:bg-white text-xs text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span>Chapitre suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

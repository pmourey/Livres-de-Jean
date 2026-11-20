import React, { useState } from 'react';
import { Book } from '../types';
import { X, BookOpen, ChevronLeft, ChevronRight, Lock, ShoppingBag, Sparkles, Scroll } from 'lucide-react';

interface ExcerptReaderModalProps {
  book: Book;
  onClose: () => void;
  onSelectForPurchase?: (book: Book) => void;
}

export const ExcerptReaderModal: React.FC<ExcerptReaderModalProps> = ({
  book,
  onClose,
  onSelectForPurchase
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F0] dark:bg-[#1E1813] w-full max-w-2xl rounded-xl shadow-2xl border border-[#DFD7C7] dark:border-[#3F3227] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E3DCCE] dark:border-[#3F3227] flex items-center justify-between bg-[#F4EFE6] dark:bg-[#251E18]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#8B1E2D] dark:text-[#E3848F]" />
            <div>
              <p className="font-serif-display font-bold text-sm text-[#2C1810] dark:text-[#F3E8D6]">
                Feuilleter l'ouvrage : {book.title}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-[#B5A58F]">
                {book.isUnpublished ? 'Manuscrit Inédit' : 'Spécimen découverte officiel'} · {book.excerptTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 dark:text-[#C0B09A] hover:text-stone-900 dark:hover:text-[#F3E8D6] hover:bg-stone-200/50 dark:hover:bg-[#3A2E24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Access Notice */}
        {book.isUnpublished ? (
          <div className="bg-amber-50/90 dark:bg-[#2E2316] border-b border-amber-200/70 dark:border-[#523F24] px-5 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-[#F2D79B]">
            <div className="flex items-center gap-2">
              <Scroll className="w-3.5 h-3.5 text-amber-700 dark:text-[#D4AF37] shrink-0" />
              <span className="text-[11px] leading-snug">
                <strong>Extrait du manuscrit inédit d'Émile Mourey.</strong> Document de recherche hors commerce (sans ISBN) — Diffusion PDF intégrale prévue prochainement.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/90 dark:bg-[#2E2316] border-b border-amber-200/70 dark:border-[#523F24] px-5 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-[#F2D79B]">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-[#D4AF37] shrink-0" />
              <span className="text-[11px] leading-snug">
                <strong>Extrait de lecture limité (spécimen de 3 pages).</strong> L'ouvrage intégral n'est pas en libre accès : la version complète (PDF ou papier broché) nécessite une commande via le panier.
              </span>
            </div>
          </div>
        )}

        {/* Reader Parchment Page */}
        <div className="p-6 sm:p-8 overflow-y-auto excerpt-scroll flex-1 font-serif-display text-[#2B231D] dark:text-[#F3E8D6] leading-relaxed text-base sm:text-lg bg-[#FCFBF7] dark:bg-[#1B1510]">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="text-center pb-4 border-b border-[#E8E2D5] dark:border-[#3F3227]">
              <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-[#8B1E2D] dark:text-[#E3848F]">
                {book.excerptTitle}
              </span>
              <div className="w-12 h-[1px] bg-[#8B1E2D]/40 dark:bg-[#D9737F]/50 mx-auto mt-2" />
            </div>

            <div className="prose prose-stone max-w-none pt-2 italic text-stone-800 dark:text-[#F3E8D6]">
              <p className="indent-6 text-justify">
                {(() => {
                  const raw = book.excerptPages[currentPage] || book.excerptPages[0] || '';
                  const cleaned = raw.trim().replace(/^«\s*/, '').replace(/\s*»$/, '').trim();
                  return cleaned ? `«\u00A0${cleaned}\u00A0»` : '';
                })()}
              </p>
            </div>

            <div className="pt-6 text-center text-xs font-sans text-stone-500 dark:text-[#A59580]">
              Page {currentPage + 1} sur {book.excerptPages.length} de l'extrait · {book.pages} pages dans l'ouvrage complet
            </div>

            {/* In-page callout */}
            {book.isUnpublished ? (
              <div className="mt-6 p-4 rounded-lg bg-amber-50/90 dark:bg-[#2E2316] border border-amber-200 dark:border-[#523F24] text-xs text-stone-700 dark:text-[#E6DAC6] space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5 text-amber-950 dark:text-[#F2D79B] font-bold">
                  <Scroll className="w-3.5 h-3.5 text-amber-700 dark:text-[#D4AF37]" />
                  <span>Manuscrit Inédit hors commerce</span>
                </div>
                <p className="text-[11px] text-amber-900 dark:text-[#E8D2A6] leading-relaxed">
                  {book.availabilityNotice || "Cet ouvrage sans dépôt légal (pas d'ISBN) sera consultable prochainement en version numérique PDF intégrale (ou impression à la demande). Non disponible à la vente directe."}
                </p>
              </div>
            ) : (
              <div className="mt-6 p-4 rounded-lg bg-[#F5F1E9] dark:bg-[#2A211A] border border-stone-200 dark:border-[#4A3C30] text-xs text-stone-700 dark:text-[#D8CBB6] space-y-2 font-sans">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 dark:text-[#F3E8D6] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D] dark:text-[#E3848F]" />
                    Envie de lire la suite ?
                  </span>
                  <span className="font-bold text-[#8B1E2D] dark:text-[#E3848F] font-serif-display text-sm">
                    Dès {Number(book.priceEbook ?? 9.9).toFixed(2)} €
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-[#C8B9A3] leading-relaxed">
                  Retrouvez l'intégralité des chapitres, plans topographiques et relevés d'Émile Mourey en commandant l'ouvrage complet au format PDF téléchargeable ou en livre relié avec dédicace manuscrite offerte.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation & CTA */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#E8E2D5] dark:border-[#3F3227] bg-[#F4EFE6] dark:bg-[#251E18] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-stone-300 dark:border-[#4A3C30] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-[#3A2E24] text-stone-700 dark:text-[#E6DAC6] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Page précédente</span>
            </button>

            <span className="text-xs text-stone-500 dark:text-[#B5A58F] font-sans">
              {currentPage + 1} / {book.excerptPages.length}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(book.excerptPages.length - 1, p + 1))}
              disabled={currentPage === book.excerptPages.length - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-stone-300 dark:border-[#4A3C30] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-[#3A2E24] text-stone-700 dark:text-[#E6DAC6] transition-colors cursor-pointer"
            >
              <span>Page suivante</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!book.isUnpublished && onSelectForPurchase ? (
            <button
              onClick={() => {
                onClose();
                onSelectForPurchase(book);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-semibold rounded shadow-xs transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Commander l'ouvrage complet</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded transition-colors"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

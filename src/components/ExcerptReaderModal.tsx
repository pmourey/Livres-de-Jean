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
      <div className="bg-[#FAF7F0] w-full max-w-2xl rounded-xl shadow-2xl border border-[#DFD7C7] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E3DCCE] flex items-center justify-between bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#8B1E2D]" />
            <div>
              <p className="font-serif-display font-bold text-sm text-[#2C1810]">
                Feuilleter l'ouvrage : {book.title}
              </p>
              <p className="text-[11px] text-stone-500">
                {book.isUnpublished ? 'Manuscrit Inédit' : 'Spécimen découverte officiel'} · {book.excerptTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Access Notice */}
        {book.isUnpublished ? (
          <div className="bg-amber-50/90 border-b border-amber-200/70 px-5 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Scroll className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="text-[11px] leading-snug">
                <strong>Extrait du manuscrit inédit d'Émile Mourey.</strong> Document de recherche hors commerce (sans ISBN) — Diffusion PDF intégrale prévue prochainement.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/90 border-b border-amber-200/70 px-5 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="text-[11px] leading-snug">
                <strong>Extrait de lecture limité (spécimen de 3 pages).</strong> L'ouvrage intégral n'est pas en libre accès : la version complète (PDF ou papier broché) nécessite une commande via le panier.
              </span>
            </div>
          </div>
        )}

        {/* Reader Parchment Page */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 font-serif-display text-[#2B231D] leading-relaxed text-base sm:text-lg bg-[#FCFBF7]">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="text-center pb-4 border-b border-[#E8E2D5]">
              <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-[#8B1E2D]">
                {book.excerptTitle}
              </span>
              <div className="w-12 h-[1px] bg-[#8B1E2D]/40 mx-auto mt-2" />
            </div>

            <div className="prose prose-stone max-w-none pt-2 italic text-stone-800">
              <p className="indent-6 text-justify">
                {book.excerptPages[currentPage] || book.excerptPages[0]}
              </p>
            </div>

            <div className="pt-6 text-center text-xs font-sans text-stone-400">
              Page {currentPage + 1} sur {book.excerptPages.length} de l'extrait · {book.pages} pages dans l'ouvrage complet
            </div>

            {/* In-page callout */}
            {book.isUnpublished ? (
              <div className="mt-6 p-4 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-stone-700 space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold">
                  <Scroll className="w-3.5 h-3.5 text-amber-700" />
                  <span>Manuscrit Inédit hors commerce</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  {book.availabilityNotice || "Cet ouvrage sans dépôt légal (pas d'ISBN) sera consultable prochainement en version numérique PDF intégrale (ou impression à la demande). Non disponible à la vente directe."}
                </p>
              </div>
            ) : (
              <div className="mt-6 p-4 rounded-lg bg-[#F5F1E9] border border-stone-200 text-xs text-stone-700 space-y-2 font-sans">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D]" />
                    Envie de lire la suite ?
                  </span>
                  <span className="font-bold text-[#8B1E2D] font-serif-display text-sm">
                    Dès {Number(book.priceEbook || 9.9).toFixed(2)} €
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Retrouvez l'intégralité des chapitres, plans topographiques et relevés d'Émile Mourey en commandant l'ouvrage complet au format PDF téléchargeable ou en livre relié avec dédicace manuscrite offerte.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation & CTA */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#E8E2D5] bg-[#F4EFE6] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-stone-700 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Page précédente</span>
            </button>

            <span className="text-xs text-stone-500 font-sans">
              {currentPage + 1} / {book.excerptPages.length}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(book.excerptPages.length - 1, p + 1))}
              disabled={currentPage === book.excerptPages.length - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded border border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-stone-700 transition-colors"
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

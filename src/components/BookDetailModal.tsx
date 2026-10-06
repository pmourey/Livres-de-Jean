import React, { useState } from 'react';
import { Book, BookFormat } from '../types';
import { BookCover } from './BookCover';
import { 
  X, BookOpen, ShoppingBag, Feather, Check, Sparkles, Scale, 
  Layers, FileText, Monitor, Package, ExternalLink 
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onAddToCart: (
    book: Book,
    quantity: number,
    format: BookFormat,
    unitPrice: number,
    dedicationRequested: boolean,
    recipient?: string,
    message?: string
  ) => void;
  onOpenExcerpt: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onAddToCart,
  onOpenExcerpt
}) => {
  const [selectedFormat, setSelectedFormat] = useState<BookFormat>('papier');
  const [quantity, setQuantity] = useState(1);
  const [wantsDedication, setWantsDedication] = useState(false);
  const [dedicationRecipient, setDedicationRecipient] = useState('');
  const [dedicationMessage, setDedicationMessage] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const getUnitPrice = (fmt: BookFormat): number => {
    switch (fmt) {
      case 'numerique_pdf':
        return book.priceEbook ?? 9.9;
      case 'pack_duo':
        return book.priceCombo ?? ((book.price ?? 22.0) + 4.0);
      case 'papier':
      default:
        return book.price ?? 22.0;
    }
  };

  const currentUnitPrice = getUnitPrice(selectedFormat);

  const handleAdd = () => {
    onAddToCart(
      book,
      quantity,
      selectedFormat,
      currentUnitPrice,
      selectedFormat !== 'numerique_pdf' && wantsDedication,
      selectedFormat !== 'numerique_pdf' && wantsDedication ? dedicationRecipient : undefined,
      selectedFormat !== 'numerique_pdf' && wantsDedication ? dedicationMessage : undefined
    );
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-4xl rounded-lg shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#F5F1E9]">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>{book.category}</span>
            <span>·</span>
            <span>{book.publisher}</span>
            <span>·</span>
            <span className="font-semibold text-stone-700">Par Émile Mourey</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Book visual & Specs */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="p-2 bg-stone-100 rounded-md shadow-inner border border-stone-200 mb-5">
                <BookCover book={book} size="lg" />
              </div>

              {/* Technical Specifications */}
              <div className="w-full bg-white rounded-md p-4 border border-stone-200 text-xs space-y-2.5 text-stone-700">
                <h4 className="font-serif-display font-bold text-sm text-[#2B1810] border-b border-stone-200 pb-1.5 flex items-center justify-between">
                  <span>Fiche technique</span>
                  <span className="font-sans text-[11px] font-normal text-stone-500">Auto-édition</span>
                </h4>
                <div className="flex justify-between py-0.5">
                  <span className="text-stone-500">Auteur :</span>
                  <span className="font-medium text-stone-900">{book.author}</span>
                </div>
                {book.tome && (
                  <div className="flex justify-between py-0.5">
                    <span className="text-stone-500">Tome :</span>
                    <span className="font-semibold text-stone-800">{book.tome}</span>
                  </div>
                )}
                <div className="flex justify-between py-0.5">
                  <span className="text-stone-500">ISBN-13 :</span>
                  <span className="font-mono text-stone-800">{book.isbn}</span>
                </div>
                {book.isbn10 && (
                  <div className="flex justify-between py-0.5">
                    <span className="text-stone-500">ISBN-10 :</span>
                    <span className="font-mono text-stone-800">{book.isbn10}</span>
                  </div>
                )}
                <div className="flex justify-between py-0.5">
                  <span className="text-stone-500">Pages :</span>
                  <span className="text-stone-800">{book.pages} pages</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-stone-500">Format papier :</span>
                  <span className="text-stone-800">{book.dimensions}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-stone-400" /> Poids d'envoi :
                  </span>
                  <span className="font-semibold text-stone-800 tabular-nums">
                    {selectedFormat === 'numerique_pdf' ? '0 g (Numérique)' : `${book.weightGrams} g`}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-t border-stone-100 pt-1.5">
                  <span className="text-stone-500">Disponibilité :</span>
                  <span className={`font-semibold ${book.inStock > 5 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {book.inStock > 0 ? `En stock papier (${book.inStock} ex.) · Immédiat en PDF` : 'Disponible en PDF'}
                  </span>
                </div>
              </div>

              {/* Action buttons: Excerpt */}
              <div className="w-full mt-3 space-y-2">
                <button
                  onClick={() => onOpenExcerpt(book)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-md border border-[#8B1E2D] text-[#8B1E2D] hover:bg-[#8B1E2D]/5 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Feuilleter un extrait gratuit (3 pages)</span>
                </button>

                {book.amazonUrl && (
                  <div className="text-center pt-1">
                    <a
                      href={book.amazonUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-stone-500 hover:text-[#8B1E2D] underline inline-flex items-center gap-1"
                    >
                      <span>Consulter la fiche référence sur Amazon / Decitre</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Title, Synopsis, Format Choice, Dedication & Purchase */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1810] leading-tight">
                  {book.title}
                </h2>
                <p className="font-serif-display italic text-base text-stone-600 mt-1">
                  {book.subtitle}
                </p>
              </div>

              {/* FORMAT SELECTOR (CRITICAL: Digital versions are PAID) */}
              <div className="space-y-2 bg-stone-100/70 p-4 rounded-lg border border-stone-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                  <span>Choisissez votre format :</span>
                  <span className="text-[11px] font-normal text-stone-500">Paiement sécurisé via panier</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {/* Format 1: Livre Papier */}
                  <div
                    onClick={() => setSelectedFormat('papier')}
                    className={`p-3 rounded-md border cursor-pointer text-left transition-all ${
                      selectedFormat === 'papier'
                        ? 'border-[#8B1E2D] bg-white ring-2 ring-[#8B1E2D]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-display font-bold text-sm text-stone-900 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#8B1E2D]" />
                        Papier
                      </span>
                      <span className="font-bold font-serif-display text-sm text-[#8B1E2D] tabular-nums">
                        {(book.price ?? 22.0).toFixed(2)} €
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Livre broché expédié par Colissimo + Dédicace offerte
                    </p>
                  </div>

                  {/* Format 2: Version Numérique PDF (PAID VIA CART) */}
                  <div
                    onClick={() => setSelectedFormat('numerique_pdf')}
                    className={`p-3 rounded-md border cursor-pointer text-left transition-all ${
                      selectedFormat === 'numerique_pdf'
                        ? 'border-[#8B1E2D] bg-white ring-2 ring-[#8B1E2D]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-display font-bold text-sm text-stone-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        eBook PDF
                      </span>
                      <span className="font-bold font-serif-display text-sm text-[#8B1E2D] tabular-nums">
                        {(book.priceEbook ?? 9.9).toFixed(2)} €
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Téléchargement immédiat après achat · 0 € de port
                    </p>
                  </div>

                  {/* Format 3: Pack Duo Papier + PDF */}
                  <div
                    onClick={() => setSelectedFormat('pack_duo')}
                    className={`p-3 rounded-md border cursor-pointer text-left transition-all ${
                      selectedFormat === 'pack_duo'
                        ? 'border-[#8B1E2D] bg-white ring-2 ring-[#8B1E2D]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-display font-bold text-sm text-stone-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Pack Duo
                      </span>
                      <span className="font-bold font-serif-display text-sm text-[#8B1E2D] tabular-nums">
                        {(book.priceCombo ?? ((book.price ?? 22.0) + 4.0)).toFixed(2)} €
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Livre broché dédicacé + Accès PDF immédiat
                    </p>
                  </div>
                </div>

                {selectedFormat === 'numerique_pdf' && (
                  <p className="text-[11px] text-blue-800 bg-blue-50 p-2 rounded border border-blue-200 mt-1">
                    ℹ️ <strong>Format 100 % Numérique :</strong> Aucun frais de livraison. Le bouton de téléchargement du PDF officiel s'activera directement dans votre <em>Espace Client</em> dès la validation de votre paiement.
                  </p>
                )}
              </div>

              {/* Price display */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold font-serif-display text-[#8B1E2D] tabular-nums">
                  {(currentUnitPrice ?? 22.0).toFixed(2)} €
                </span>
                <span className="text-xs text-stone-500">
                  Prix net (TVA non applicable, art. 293 B du CGI)
                </span>
              </div>

              {/* Synopsis */}
              <div className="space-y-2">
                <h3 className="font-serif-display text-lg font-bold text-[#2B1810] border-b border-stone-200 pb-1">
                  Présentation de l'ouvrage
                </h3>
                {book.fullSynopsis.map((paragraph, idx) => (
                  <p key={idx} className="text-sm text-stone-700 leading-relaxed text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Table of contents preview */}
              <div className="bg-[#F5F1E9]/70 rounded-md p-4 border border-stone-200">
                <h4 className="font-serif-display font-bold text-sm text-[#2B1810] mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#8B1E2D]" />
                  Sommaire & Grandes Lignes
                </h4>
                <ul className="text-xs text-stone-600 space-y-1 pl-4 list-disc marker:text-[#8B1E2D]">
                  {book.tableOfContents.map((chap, idx) => (
                    <li key={idx}>{chap}</li>
                  ))}
                </ul>
              </div>

              {/* Author Free Dedication Option (Available for Paper and Duo) */}
              {selectedFormat !== 'numerique_pdf' ? (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-md p-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={wantsDedication}
                      onChange={(e) => setWantsDedication(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-stone-300 text-[#8B1E2D] focus:ring-[#8B1E2D]"
                    />
                    <div>
                      <span className="font-serif-display font-bold text-sm text-[#2B1810] flex items-center gap-1.5">
                        <Feather className="w-4 h-4 text-[#8B1E2D]" />
                        Demander une dédicace personnalisée par l’auteur (Offerte)
                      </span>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Émile Mourey calligraphiera une dédicace manuscrite sur la page de garde avant l’envoi postal de votre exemplaire.
                      </p>
                    </div>
                  </label>

                  {wantsDedication && (
                    <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Prénom / Nom du destinataire de la dédicace :
                        </label>
                        <input
                          type="text"
                          value={dedicationRecipient}
                          onChange={(e) => setDedicationRecipient(e.target.value)}
                          placeholder="Ex : Pour Jean-Pierre..."
                          className="w-full text-xs px-3 py-1.5 bg-white border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8B1E2D]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Précision ou message particulier (optionnel) :
                        </label>
                        <input
                          type="text"
                          value={dedicationMessage}
                          onChange={(e) => setDedicationMessage(e.target.value)}
                          placeholder="Ex : Passionné d'histoire éduenne..."
                          className="w-full text-xs px-3 py-1.5 bg-white border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-[#8B1E2D]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Purchase Controls */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-stone-300 rounded-md bg-white w-fit">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-semibold text-stone-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(book.inStock || 10, q + 1))}
                    className="px-3 py-2 text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAdd}
                  disabled={selectedFormat === 'papier' && book.inStock === 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#8B1E2D] hover:bg-[#721824] disabled:bg-stone-300 text-white font-semibold text-sm rounded-md shadow transition-all duration-200"
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        Ajouter au panier ({selectedFormat === 'numerique_pdf' ? 'eBook PDF' : selectedFormat === 'pack_duo' ? 'Duo' : 'Papier'}) · {((currentUnitPrice ?? 22.0) * quantity).toFixed(2)} €
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

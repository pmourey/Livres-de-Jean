import React, { useState } from 'react';
import { Book, BookFormat } from '../types';
import { BookCover } from './BookCover';
import { amazonKindleSearchUrl } from '../config/commerce';
import { 
  X, BookOpen, ShoppingBag, Feather, Check, Sparkles, Scale, 
  Layers, FileText, Package, ExternalLink, Clock, AlertTriangle, Scroll, Lock
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
  isMaintenanceMode?: boolean;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onAddToCart,
  onOpenExcerpt,
  isMaintenanceMode = false
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
        return Number(book.priceEbook ?? 9.9);
      case 'pack_duo':
        return Number(book.priceCombo || ((book.price || 22.0) + 4.0));
      case 'papier':
      default:
        return Number(book.price || 22.0);
    }
  };

  const currentUnitPrice = getUnitPrice(selectedFormat);
  const kindleUrl =
    book.kindleUrl ||
    (book.kindleAsin
      ? `https://www.amazon.fr/dp/${book.kindleAsin}/`
      : book.amazonKindleUrl || amazonKindleSearchUrl(book.title, book.author));

  const handleAdd = () => {
    if (book.isUnpublished) return;
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
        {/* Header */}
        <div className="px-6 py-4 bg-[#F5F1E9] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs uppercase tracking-wider text-[#8B1E2D] font-bold">
              {book.isUnpublished ? 'Manuscrit Inédit · Archive de Recherche' : 'Fiche Ouvrage & Commande'}
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-xs text-stone-500 font-mono">
              {book.isUnpublished ? 'Hors Commerce (Sans ISBN)' : `ISBN ${book.isbn10 || book.isbn}`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:text-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Visual Cover & Technical Data */}
            <div className="md:col-span-5 flex flex-col items-center text-center space-y-4">
              <BookCover book={book} size="lg" />

              <div className="w-full pt-3 space-y-2 text-xs text-stone-600 border-t border-stone-200 text-left">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Éditeur :</span>
                  <span className="font-medium text-stone-800">{book.publisher}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Année :</span>
                  <span className="font-medium text-stone-800">{book.publicationYear}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Pagination :</span>
                  <span className="font-medium text-stone-800">{book.pages} pages</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Dimensions :</span>
                  <span className="font-medium text-stone-800 truncate max-w-[180px]">{book.dimensions}</span>
                </div>
                {!book.isUnpublished && (
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Poids unitaire :</span>
                    <span className="font-medium text-stone-800">{book.weightGrams} g</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Statut :</span>
                  <span className={`font-medium ${book.isUnpublished ? 'text-amber-800' : 'text-emerald-700'}`}>
                    {book.isUnpublished ? 'Manuscrit Hors Vente' : book.inStock > 0 ? `En stock (${book.inStock} ex.)` : 'Sur commande'}
                  </span>
                </div>
              </div>

              {/* Read sample button */}
              <button
                onClick={() => onOpenExcerpt(book)}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded border border-stone-300 flex items-center justify-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#8B1E2D]" />
                <span>Feuilleter l'extrait de lecture</span>
              </button>

              {/* Amazon / Kindle Direct Access */}
              <div className="w-full space-y-1.5 pt-2 border-t border-stone-200">
                <a
                  href={kindleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-semibold rounded border border-amber-300 flex items-center justify-between transition-colors shadow-2xs"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="font-bold text-[#8B1E2D]">Kindle</span>
                    <span>Format Liseuse Amazon</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-amber-800">
                    {book.kindleAsin ? `ASIN ${book.kindleAsin}` : 'Amazon'}
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </span>
                </a>

                {book.amazonUrl && (
                  <a
                    href={book.amazonUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center py-1 text-stone-600 hover:text-[#8B1E2D] text-[11px] inline-flex items-center justify-center gap-1"
                  >
                    <span>Fiche Broché Amazon / Decitre</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Title, Synopsis, Format Choice or Unpublished Notice */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1810] leading-tight">
                  {book.title}
                </h2>
                <p className="font-serif-display italic text-base text-stone-600 mt-1">
                  {book.subtitle}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-stone-500">Par</span>
                  <span className="text-xs font-bold text-stone-800 font-serif-display">{book.author}</span>
                  {book.tome && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-mono">
                      {book.tome}
                    </span>
                  )}
                </div>
              </div>

              {/* UNPUBLISHED NOTICE OR FORMAT SELECTOR */}
              {book.isUnpublished ? (
                /* Dedicated Archival Box for Unpublished Works */
                <div className="bg-amber-50/90 border-2 border-amber-300/80 rounded-lg p-4 sm:p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-amber-950 text-sm">
                        Manuscrit d'Auteur Inédit — Consultation et Recherche Documentaire
                      </h4>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {book.availabilityNotice ||
                          "Conformément aux règles de protection des droits d'auteur et pour préserver l'antériorité de l'œuvre d'Émile Mourey, aucun fichier PDF brut n'est vendu en téléchargement direct. L'ouvrage est réservé à la consultation d'extraits en ligne."}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/90 rounded border border-amber-200 text-xs text-stone-700 space-y-1.5">
                    <div className="flex items-center gap-2 text-stone-900 font-semibold">
                      <Scroll className="w-4 h-4 text-amber-700" />
                      <span>Modalités d'accès :</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-normal">
                      • <strong>Consultation d'extraits certifiés :</strong> Accès immédiat et gratuit dans le visualiseur en ligne.<br />
                      • <strong>Format Kindle Amazon :</strong> Disponible sur Amazon (recherche ou ASIN direct ci-dessous).<br />
                      • <strong>Impression reliée d'art :</strong> Service à la demande en cours de mise en place.
                    </p>
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onOpenExcerpt(book)}
                      className="px-4 py-2 bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>Consulter les extraits du texte</span>
                    </button>

                    <a
                      href={kindleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <span>Format Kindle Amazon</span>
                      <ExternalLink className="w-3 h-3 text-amber-300" />
                    </a>
                  </div>
                </div>
              ) : (
                /* FORMAT SELECTOR (Commercial Books: Digital is PAID via cart) */
                <div className="space-y-3 bg-stone-100/70 p-4 rounded-lg border border-stone-200">
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
                          {Number(book.price || 22.0).toFixed(2)} €
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
                          {Number(book.priceEbook ?? 9.9).toFixed(2)} €
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
                          {Number(book.priceCombo || ((book.price || 22.0) + 4.0)).toFixed(2)} €
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">
                        Livre broché dédicacé + Accès PDF immédiat
                      </p>
                    </div>
                  </div>

                  {selectedFormat === 'numerique_pdf' && (
                    <p className="text-[11px] text-blue-900 bg-blue-50/80 p-2.5 rounded border border-blue-200 mt-1 leading-relaxed">
                      ℹ️ <strong>Format Numérique Officiel (Cloudflare R2) :</strong> Fichier PDF servi depuis le stockage Cloudflare R2 avec en-têtes sécurisés. Téléchargement immédiat activé dans votre <em>Espace Client</em> après validation de la commande.
                    </p>
                  )}

                  {/* Price display and Kindle alternative */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-serif-display text-[#8B1E2D] tabular-nums">
                        {Number(currentUnitPrice || 22.0).toFixed(2)} €
                      </span>
                      <span className="text-[10px] text-stone-500">
                        (TVA non applicable, art. 293 B du CGI)
                      </span>
                    </div>

                    <a
                      href={kindleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#8B1E2D] hover:text-[#721824] font-semibold underline decoration-stone-300 underline-offset-2"
                    >
                      <span>Acheter au format Kindle {book.kindleAsin ? `(${book.kindleAsin})` : ''}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>
              )}

              {/* Synopsis */}
              <div className="space-y-2">
                <h4 className="font-serif-display font-bold text-sm text-[#2B1810]">
                  Présentation & Thèse Historique
                </h4>
                <div className="space-y-2 text-xs text-stone-700 leading-relaxed text-justify">
                  {book.fullSynopsis.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Significant Quotes Box */}
              {book.keyQuotes && book.keyQuotes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-serif-display font-bold text-sm text-[#2B1810] flex items-center gap-1.5">
                    <Feather className="w-4 h-4 text-[#8B1E2D]" />
                    <span>Extraits significatifs et citations du texte</span>
                  </h4>
                  <div className="space-y-2">
                    {book.keyQuotes.map((q, idx) => (
                      <blockquote
                        key={idx}
                        className="p-3 bg-stone-100/80 rounded border-l-4 border-[#8B1E2D] text-xs text-stone-800 italic leading-relaxed"
                      >
                        « {q} »
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              {/* Table of Contents */}
              <div className="space-y-2 pt-1">
                <h4 className="font-serif-display font-bold text-sm text-[#2B1810] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-stone-500" />
                  <span>Table des matières & Plan de l'ouvrage</span>
                </h4>
                <ul className="grid grid-cols-1 gap-1 text-xs text-stone-600 bg-stone-50 p-3 rounded border border-stone-200">
                  {book.tableOfContents.map((chap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#8B1E2D] font-mono font-bold">•</span>
                      <span>{chap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dedication Form (Only for physical books of commercial titles) */}
              {!book.isUnpublished && selectedFormat !== 'numerique_pdf' && (
                <div className="p-4 bg-amber-50/70 rounded-lg border border-amber-200/80 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Feather className="w-4 h-4 text-[#8B1E2D]" />
                      <span className="font-serif-display font-bold text-sm text-amber-950">
                        Dédicace de l'Auteur Émile Mourey (Offerte)
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wantsDedication}
                        onChange={(e) => setWantsDedication(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B1E2D]"></div>
                    </label>
                  </div>

                  <p className="text-[11px] text-amber-900 leading-normal">
                    Monsieur Émile Mourey dédicace personnellement chaque exemplaire commandé en direct. Cochez cette option pour personnaliser le destinataire et le message.
                  </p>

                  {wantsDedication && (
                    <div className="space-y-2 pt-2 border-t border-amber-200 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Prénom & Nom du destinataire de la dédicace :
                        </label>
                        <input
                          type="text"
                          value={dedicationRecipient}
                          onChange={(e) => setDedicationRecipient(e.target.value)}
                          placeholder="Ex : Pour Philippe Mourey, passionné d'histoire"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                          Consigne ou message particulier pour l'auteur (optionnel) :
                        </label>
                        <textarea
                          rows={2}
                          value={dedicationMessage}
                          onChange={(e) => setDedicationMessage(e.target.value)}
                          placeholder="Ex : Pour mon anniversaire, avec vos remerciements pour vos recherches sur Bibracte..."
                          className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Purchase or Close Controls */}
              {book.isUnpublished ? (
                <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-xs text-stone-500 italic">
                    Manuscrit inédit non commercialisé par le panier.
                  </span>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs rounded transition-colors"
                  >
                    Fermer la fiche
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {isMaintenanceMode && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-md text-xs text-amber-950 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="block font-bold text-amber-950">Site en cours de construction</strong>
                        <p className="text-[11px] text-amber-900 leading-normal">
                          Les commandes et paiements en ligne d'ouvrages sont temporairement suspendus. Vous pouvez librement feuilleter les extraits de ce livre ou accéder à l'édition Kindle ci-dessus.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Quantity */}
                    {!isMaintenanceMode && (
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
                    )}

                    {/* Add to Cart button */}
                    {isMaintenanceMode ? (
                      <button
                        disabled
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-300 text-stone-600 font-semibold text-sm rounded-md shadow-none cursor-not-allowed opacity-90"
                      >
                        <Lock className="w-4 h-4 text-stone-500" />
                        <span>Commandes suspendues (Site en construction)</span>
                      </button>
                    ) : (
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
                              Ajouter au panier ({selectedFormat === 'numerique_pdf' ? 'eBook PDF' : selectedFormat === 'pack_duo' ? 'Duo' : 'Papier'}) · {((Number(currentUnitPrice || 22.0)) * quantity).toFixed(2)} €
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

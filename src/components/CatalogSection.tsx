import React, { useState } from 'react';
import { Book, BookFormat } from '../types';
import { BookCover } from './BookCover';
import { 
  Search, SlidersHorizontal, Eye, ShoppingBag, Feather, 
  ExternalLink, Sparkles, BookOpen, Clock, AlertCircle, FileText 
} from 'lucide-react';

interface CatalogSectionProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onQuickAddToCart: (book: Book, format: BookFormat) => void;
  onOpenExcerpt: (book: Book) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  books,
  onSelectBook,
  onQuickAddToCart,
  onOpenExcerpt
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'year'>('featured');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Tous les ouvrages' },
    { id: 'Histoire de Bibracte', label: 'Histoire de Bibracte (Tomes 2 à 5)' },
    { id: 'Gergovie & Gaule', label: 'Gergovie (Tome 1)' },
    { id: 'Histoire du Christ', label: 'Histoire du Christ (Tomes 1 & 2)' },
    { id: 'Histoire de Mahomet', label: 'Histoire de Mahomet (Tomes 1 & 2 · Inédits)' },
    { id: 'Manuscrits Inédits', label: 'Manuscrits Inédits (La Gaule en héritage)' },
    { id: 'Coffrets & Intégrales', label: 'Coffrets & Intégrales' }
  ];

  // Filtering
  const filteredBooks = books.filter((book) => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      (book.title && book.title.toLowerCase().includes(q)) ||
      (book.subtitle && book.subtitle.toLowerCase().includes(q)) ||
      (book.shortDescription && book.shortDescription.toLowerCase().includes(q)) ||
      (book.tome && book.tome.toLowerCase().includes(q)) ||
      (book.isbn && book.isbn.toLowerCase().includes(q)) ||
      (book.isbn10 && book.isbn10.toLowerCase().includes(q)) ||
      (book.keyQuotes && book.keyQuotes.some((k) => k.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  // Sorting
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'year') return (b.publicationYear || 0) - (a.publicationYear || 0);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const featuredBook =
    books.find((b) => b.id === 'mourey-bibracte-tome-2-bouclier-eduen') ||
    books.find((b) => b.id === 'mourey-gergovie-tome-1') ||
    books[0];

  return (
    <div className="space-y-12">
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden bg-[#241310] text-[#FAF8F5] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 rounded-b-2xl shadow-xl">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-cinzel tracking-[0.25em] uppercase font-bold">
            <span>Catalogue & Archives Officielles Émile Mourey</span>
            <span>·</span>
            <span>Vente Directe & Diffusion Historique</span>
          </div>

          <h1 className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            L'Histoire de Bibracte, Gergovie et les Premiers Siècles
          </h1>

          <p className="font-serif-display italic text-base sm:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed">
            Les recherches historiques et topographiques majeures d'Émile Mourey sur le Mont Saint-Vincent, les Éduens et les sources antiques. Commandez en version papier dédicacée ou en version numérique PDF avec paiement sécurisé.
          </p>

          {/* Formats banner notice */}
          <div className="pt-2 max-w-3xl mx-auto">
            <div className="bg-stone-900/90 border border-[#D4AF37]/40 rounded-lg p-3.5 sm:p-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    Modalités d'accès et de commande des ouvrages :
                  </span>
                  <p className="text-stone-300 text-[11px] mt-0.5">
                    • <strong>Livres publiés (avec ISBN) :</strong> Versions papier brochées expédiées avec dédicace offerte, et versions numériques officielles (eBook PDF payant via le panier).<br />
                    • <strong>Manuscrits inédits (Histoire de Mahomet, La Gaule en héritage) :</strong> Hors commerce (sans ISBN), bientôt consultables en PDF patrimonial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Controls Bar: Categories, Search & Sort */}
        <div className="bg-[#F5F1E9] p-4 sm:p-6 rounded-lg border border-stone-200 space-y-4">
          {/* Top row: Categories pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-cinzel text-stone-700 font-bold tracking-wider mr-2 uppercase">
              Catégories :
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#8B1E2D] text-white shadow-2xs font-semibold'
                    : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Bottom row: Search & Sort controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2 border-t border-stone-200">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par titre, tome, source antique, extrait..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E2D] focus:border-[#8B1E2D]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                >
                  ×
                </button>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-xs text-stone-600">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B1E2D]"
              >
                <option value="featured">Recommandations de l'auteur</option>
                <option value="year">Date de parution / rédaction</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>
            {sortedBooks.length} ouvrage{sortedBooks.length > 1 ? 's' : ''} répertorié{sortedBooks.length > 1 ? 's' : ''}
            {selectedCategory !== 'all' ? ` dans cette catégorie` : ''}
          </span>
          <span className="italic">Vente directe par l'auteur · Frais de port offerts dès 55 € d'achat</span>
        </div>

        {/* Book Grid */}
        {sortedBooks.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-lg p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 mx-auto text-stone-300" />
            <h3 className="font-serif-display font-bold text-lg text-stone-800">
              Aucun ouvrage ne correspond à votre recherche
            </h3>
            <p className="text-xs text-stone-500">
              Essayez de modifier votre mot-clé ou sélectionnez "Tous les ouvrages" pour réinitialiser les filtres.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-semibold"
            >
              Réinitialiser le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedBooks.map((book) => (
              <div
                key={book.id}
                className="group bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                {/* Book Card Top: Visual & Description */}
                <div className="p-5 space-y-4">
                  {/* Visual Cover + Meta header */}
                  <div className="flex gap-4 items-start">
                    <div
                      onClick={() => onSelectBook(book)}
                      className="cursor-pointer shrink-0 transition-transform group-hover:scale-102"
                      title="Cliquer pour voir la fiche détaillée"
                    >
                      <BookCover book={book} size="md" />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {book.isUnpublished ? (
                        <span className="inline-block text-[9px] font-cinzel font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded uppercase tracking-wider">
                          Manuscrit Inédit · Hors Vente
                        </span>
                      ) : (
                        <span className="inline-block text-[9px] font-cinzel font-bold text-[#8B1E2D] bg-[#8B1E2D]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          {book.category}
                        </span>
                      )}

                      <h3
                        onClick={() => onSelectBook(book)}
                        className="font-serif-display font-bold text-base sm:text-lg text-[#2B1810] leading-snug cursor-pointer hover:text-[#8B1E2D] transition-colors"
                      >
                        {book.title}
                      </h3>

                      <p className="font-serif-display italic text-xs text-stone-600 line-clamp-2">
                        {book.subtitle}
                      </p>

                      <div className="text-[11px] text-stone-500 pt-1 space-y-0.5">
                        <p>Auteur : <strong className="text-stone-700">{book.author}</strong></p>
                        <p>{book.publicationYear} · {book.pages} pages</p>
                      </div>
                    </div>
                  </div>

                  {/* Short excerpt / description */}
                  <p className="text-xs text-stone-600 mt-2 line-clamp-3 text-justify leading-relaxed">
                    {book.shortDescription}
                  </p>

                  {/* Significant quote if available */}
                  {book.keyQuotes && book.keyQuotes.length > 0 && (
                    <div className="mt-2 text-[11px] italic text-stone-700 bg-stone-50/90 p-2.5 rounded border-l-2 border-[#8B1E2D] line-clamp-2 leading-snug">
                      « {book.keyQuotes[0]} »
                    </div>
                  )}

                  {/* ISBN and External Reference links */}
                  <div className="w-full mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                    <span className="font-mono">
                      {book.isUnpublished ? 'Sans ISBN (Pas de dépôt légal)' : `ISBN : ${book.isbn10 || book.isbn}`}
                    </span>
                    {book.amazonUrl && (
                      <a
                        href={book.amazonUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stone-500 hover:text-[#8B1E2D] inline-flex items-center gap-0.5"
                        title="Voir la référence sur Amazon / Decitre"
                      >
                        <span>Réf. Amazon</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Book Card Bottom: Price, Formats & Actions */}
                <div className="p-5 pt-3 border-t border-stone-100 bg-[#FAF8F5]/60 space-y-3">
                  {book.isUnpublished ? (
                    /* Unpublished / Manuscript Notice */
                    <div className="bg-amber-50/90 border border-amber-300/80 rounded p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Disponible prochainement en PDF</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-snug">
                        Sans dépôt légal (pas d'ISBN) · Non destiné à la vente.
                      </p>
                    </div>
                  ) : (
                    /* Published Books Pricing */
                    <>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[11px] text-stone-500 block">Dès</span>
                          <span className="font-serif-display font-bold text-xl text-[#8B1E2D] tabular-nums">
                            {Number(book.priceEbook || 9.9).toFixed(2)} €
                          </span>
                          <span className="text-xs text-stone-500 ml-1.5">
                            (PDF) · <strong className="text-stone-800">{Number(book.price || 22.0).toFixed(2)} €</strong> (Papier)
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-800 font-medium">
                          {book.inStock > 0 ? `En stock` : 'Sur commande'}
                        </span>
                      </div>

                      {/* Free dedication hint for paper */}
                      <p className="text-[10px] text-amber-900 flex items-center gap-1 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/50">
                        <Feather className="w-3 h-3 text-[#8B1E2D] shrink-0" />
                        <span>Dédicace de l'auteur offerte sur la version papier</span>
                      </p>
                    </>
                  )}

                  {/* Actions buttons */}
                  {book.isUnpublished ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onSelectBook(book)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 rounded border border-amber-300 transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Consulter la fiche</span>
                      </button>

                      <button
                        onClick={() => onOpenExcerpt(book)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 rounded border border-stone-300 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#8B1E2D]" />
                        <span>Feuilleter l'extrait</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onSelectBook(book)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 rounded border border-stone-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Choisir format</span>
                      </button>

                      <button
                        onClick={() => onSelectBook(book)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#8B1E2D] hover:bg-[#721824] rounded shadow-2xs transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Commander</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Spotlight Showcase Section: L'Intégrale de Bibracte */}
        <section className="my-14 bg-gradient-to-r from-[#2A1812] to-[#3B1E19] text-white rounded-xl p-8 sm:p-12 shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex justify-center">
              <BookCover book={featuredBook} size="lg" />
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="text-xs font-cinzel text-amber-300 font-bold tracking-widest uppercase">
                Ouvrage Majeur Recommandé par l'Auteur
              </div>
              <h2 className="font-serif-display text-2xl sm:text-4xl font-bold leading-tight">
                {featuredBook.title} : {featuredBook.subtitle}
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed text-justify">
                {featuredBook.fullSynopsis[0]}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div>
                  <span className="text-xs text-stone-300 block">
                    Version PDF : <strong>{Number(featuredBook?.priceEbook || 9.9).toFixed(2)} €</strong>
                  </span>
                  <span className="text-2xl font-serif-display font-bold text-[#D4AF37] tabular-nums">
                    Papier relié : {Number(featuredBook?.price || 22.0).toFixed(2)} €
                  </span>
                </div>
                <button
                  onClick={() => onSelectBook(featuredBook)}
                  className="px-5 py-2.5 bg-[#8B1E2D] hover:bg-[#A32335] text-white font-semibold text-xs rounded transition-colors shadow-sm"
                >
                  Choisir mon format (Papier ou PDF)
                </button>
                <button
                  onClick={() => onOpenExcerpt(featuredBook)}
                  className="px-4 py-2.5 border border-stone-400/80 hover:bg-white/10 text-stone-200 text-xs rounded transition-colors"
                >
                  Feuilleter l'extrait du livre
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Readers & Scholars Testimonials */}
        <section className="bg-white border border-stone-200 rounded-lg p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-1">
            <span className="font-cinzel text-xs uppercase tracking-widest text-[#8B1E2D] font-bold">
              Témoignages & Critiques de Lecteurs
            </span>
            <h3 className="font-serif-display font-bold text-2xl text-[#2B1810]">
              Ce que disent les passionnés d'histoire gauloise et bourguignonne
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 bg-stone-50 rounded border border-stone-200 space-y-2">
              <p className="font-serif-display italic text-xs text-stone-700 leading-relaxed">
                « L'analyse d'Émile Mourey dans Histoire de Bibracte (Tome 2 et 3) sur le Mont Saint-Vincent et le bouclier éduen apporte un éclairage indispensable que tout historien de la Gaule devrait lire. »
              </p>
              <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-600">
                <strong className="text-stone-900 block">Prof. André G.</strong>
                <span>Agrégé d'Histoire & membre d'une société savante de Bourgogne</span>
              </div>
            </div>

            <div className="p-5 bg-stone-50 rounded border border-stone-200 space-y-2">
              <p className="font-serif-display italic text-xs text-stone-700 leading-relaxed">
                « J'ai commandé Histoire de Gergovie et Histoire du Christ avec dédicace personnalisée. Colis reçu sous 48h en parfait état avec un mot très chaleureux de l'auteur. Vraiment remarquable. »
              </p>
              <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-600">
                <strong className="text-stone-900 block">Jean-Pierre M.</strong>
                <span>Lecteur passionné (Chalon-sur-Saône)</span>
              </div>
            </div>

            <div className="p-5 bg-stone-50 rounded border border-stone-200 space-y-2">
              <p className="font-serif-display italic text-xs text-stone-700 leading-relaxed">
                « Une démonstration implacable sur les camps romains et les distances militaires. C'est l'un des rares travaux où le terrain réel prend le pas sur les théories de salon. »
              </p>
              <div className="pt-2 border-t border-stone-200 text-[11px] text-stone-600">
                <strong className="text-stone-900 block">Claire V.</strong>
                <span>Archéologue et chercheuse indépendante (Autun)</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

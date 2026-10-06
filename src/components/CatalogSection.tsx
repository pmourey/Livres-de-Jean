import React, { useState } from 'react';
import { Book, BookFormat } from '../types';
import { BookCover } from './BookCover';
import { 
  Search, ShoppingBag, Eye, Feather, Sparkles, BookOpen, 
  Truck, ExternalLink, FileText, Package 
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
    { id: 'Coffrets & Intégrales', label: 'Coffrets & Intégrales' }
  ];

  // Filtering
  const filteredBooks = books.filter((book) => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.tome && book.tome.toLowerCase().includes(searchQuery.toLowerCase())) ||
      book.isbn.includes(searchQuery) ||
      (book.isbn10 && book.isbn10.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Sorting
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'year') return b.publicationYear - a.publicationYear;
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
            <span>Catalogue Officiel Émile Mourey</span>
            <span>·</span>
            <span>Vente Directe en Auto-Édition</span>
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
                    Deux formats disponibles à la commande :
                  </span>
                  <p className="text-stone-300 text-[11px]">
                    • <strong>Livre papier broché :</strong> Expédié par Colissimo avec dédicace personnalisée de l'auteur offerte.<br />
                    • <strong>eBook numérique (PDF) :</strong> Téléchargement sécurisé débloqué dans votre Espace Client dès paiement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Advantages */}
          <div className="pt-3 flex flex-wrap justify-center items-center gap-6 text-xs text-stone-300 font-sans">
            <span className="flex items-center gap-1.5">
              <Feather className="w-4 h-4 text-[#D4AF37]" /> Dédicace manuscrite offerte
            </span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#D4AF37]" /> Colissimo La Poste & Points Relais (Franco dès 55 €)
            </span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" /> CB Stripe, PayPal & Chèque postal
            </span>
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search & Filter Toolbar */}
        <div className="space-y-4">
          {/* Top row: search + sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher : Bibracte, Gergovie, Christ, Tome, ISBN..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-300 rounded-md shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#8B1E2D]"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span className="whitespace-nowrap">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-stone-300 rounded-md px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B1E2D]"
              >
                <option value="featured">Sélection de l'auteur</option>
                <option value="year">Année de parution</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          {/* Category Tabs (Segmented controls, zero-pill discipline) */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-lg overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-white text-[#2B1810] shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {sortedBooks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-stone-200 text-stone-500 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-stone-300" />
            <p className="font-serif-display text-base font-bold text-stone-800">
              Aucun ouvrage ne correspond à votre recherche
            </p>
            <p className="text-xs text-stone-500">
              Essayez de modifier vos mots-clés ou réinitialisez le filtre thématique.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 px-4 py-1.5 text-xs font-semibold text-[#8B1E2D] hover:underline"
            >
              Afficher tous les livres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedBooks.map((book) => (
              <div
                key={book.id}
                className="group bg-white rounded-lg border border-stone-200/90 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Book Card Top: Visual & Badges */}
                <div className="p-5 pb-3 flex flex-col items-center">
                  <div
                    onClick={() => onSelectBook(book)}
                    className="cursor-pointer transition-transform duration-300 group-hover:-translate-y-1"
                  >
                    <BookCover book={book} size="md" />
                  </div>

                  {/* Clean unboxed metadata (anti-slop rule) */}
                  <div className="w-full flex items-center justify-center gap-1.5 text-[11px] text-stone-500 mt-4">
                    <span>{book.author}</span>
                    <span aria-hidden="true">·</span>
                    <span>{book.tome ? book.tome : `${book.pages} p.`}</span>
                    <span aria-hidden="true">·</span>
                    <span>{book.weightGrams} g</span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mt-2 text-center space-y-1 w-full">
                    <h3
                      onClick={() => onSelectBook(book)}
                      className="font-serif-display font-bold text-lg text-[#2B1810] group-hover:text-[#8B1E2D] transition-colors leading-snug cursor-pointer line-clamp-2"
                    >
                      {book.title}
                    </h3>
                    <p className="font-serif-display italic text-xs text-stone-600 line-clamp-2">
                      {book.subtitle}
                    </p>
                  </div>

                  {/* Short excerpt / description */}
                  <p className="text-xs text-stone-600 mt-2 line-clamp-3 text-justify leading-relaxed">
                    {book.shortDescription}
                  </p>

                  {/* ISBN and External Reference links */}
                  <div className="w-full mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                    <span className="font-mono">ISBN : {book.isbn10 || book.isbn}</span>
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
                  {/* Pricing per format */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-stone-500 block">Dès</span>
                      <span className="font-serif-display font-bold text-xl text-[#8B1E2D] tabular-nums">
                        {(book.priceEbook ?? 9.9).toFixed(2)} €
                      </span>
                      <span className="text-xs text-stone-500 ml-1.5">
                        (PDF) · <strong className="text-stone-800">{(book.price ?? 22.0).toFixed(2)} €</strong> (Papier)
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

                  {/* Actions buttons */}
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
                  <span className="text-xs text-stone-300 block">Version PDF : <strong>{(featuredBook?.priceEbook ?? 9.9).toFixed(2)} €</strong></span>
                  <span className="text-2xl font-serif-display font-bold text-[#D4AF37] tabular-nums">
                    Papier relié : {(featuredBook?.price ?? 22.0).toFixed(2)} €
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

import React from 'react';
import { ShoppingBag, User, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (view: 'catalog' | 'author' | 'shipping' | 'account' | 'admin') => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onNavigate,
  currentView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark */}
        <button
          onClick={() => onNavigate('catalog')}
          className="font-serif-display text-2xl font-bold tracking-tight text-[#2B1810] hover:text-[#8B1E2D] transition-colors text-left"
        >
          Éditions Émile Mourey
        </button>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-700">
          <button
            onClick={() => onNavigate('catalog')}
            className={`transition-colors hover:text-[#8B1E2D] pb-1 border-b-2 ${
              currentView === 'catalog' ? 'border-[#8B1E2D] text-[#8B1E2D] font-semibold' : 'border-transparent'
            }`}
          >
            Catalogue
          </button>
          <button
            onClick={() => onNavigate('author')}
            className={`transition-colors hover:text-[#8B1E2D] pb-1 border-b-2 ${
              currentView === 'author' ? 'border-[#8B1E2D] text-[#8B1E2D] font-semibold' : 'border-transparent'
            }`}
          >
            L’Auteur & Travaux
          </button>
          <button
            onClick={() => onNavigate('shipping')}
            className={`transition-colors hover:text-[#8B1E2D] pb-1 border-b-2 ${
              currentView === 'shipping' ? 'border-[#8B1E2D] text-[#8B1E2D] font-semibold' : 'border-transparent'
            }`}
          >
            Livraison & Paiement
          </button>
          <button
            onClick={() => onNavigate('account')}
            className={`transition-colors hover:text-[#8B1E2D] pb-1 border-b-2 ${
              currentView === 'account' ? 'border-[#8B1E2D] text-[#8B1E2D] font-semibold' : 'border-transparent'
            }`}
          >
            Espace Client
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('admin')}
            title="Accès Espace Auteur & Gestion"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              currentView === 'admin'
                ? 'bg-stone-800 text-stone-100'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Gestion Auteur</span>
          </button>

          <button
            onClick={() => onNavigate('account')}
            className="md:hidden p-2 text-stone-700 hover:text-[#8B1E2D] rounded-md transition-colors"
            title="Espace Client"
          >
            <User className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#8B1E2D] hover:bg-[#721824] rounded-md transition-colors shadow-sm whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Panier</span>
            {cartCount > 0 && (
              <span className="bg-white text-[#8B1E2D] px-1.5 py-0.2 rounded-full font-bold text-[11px] tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

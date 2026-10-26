import React from 'react';
import { ShoppingBag, User, ShieldCheck, Lock, AlertTriangle, Wrench } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (view: 'catalog' | 'author' | 'shipping' | 'account' | 'admin') => void;
  currentView: string;
  isMaintenanceMode?: boolean;
  maintenanceMessage?: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onNavigate,
  currentView,
  isMaintenanceMode = true,
  maintenanceMessage
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E2D9]">
      {/* Non-dismissible prominent maintenance banner */}
      {isMaintenanceMode && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 border-b border-amber-600/40 px-3 sm:px-6 py-2.5 shadow-sm"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <span className="flex-shrink-0 inline-flex items-center justify-center p-1.5 rounded-full bg-stone-950 text-amber-400 shadow-xs">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </span>
              <div className="text-xs sm:text-sm">
                <span className="font-bold uppercase tracking-wider text-[10px] sm:text-[11px] bg-stone-950 text-amber-300 px-2 py-0.5 rounded mr-2 font-mono shadow-2xs">
                  Site en construction
                </span>
                <span className="font-semibold text-stone-950">
                  {maintenanceMessage || "Les commandes et paiements d'ouvrages sont temporairement suspendus. La consultation du catalogue et la lecture des extraits restent disponibles."}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] font-semibold text-stone-900/85 hidden md:inline bg-amber-600/20 px-2 py-0.5 rounded border border-amber-600/30">
                Paiements CB / PayPal suspendus
              </span>
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs font-semibold text-stone-950 hover:text-[#8B1E2D] underline underline-offset-2 transition-colors cursor-pointer"
                title="Accéder à l'espace de gestion auteur"
              >
                Espace Auteur
              </button>
            </div>
          </div>
        </div>
      )}

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
            title="Espace Auteur & Gestion Commerciale (Accès Protégé)"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors border ${
              currentView === 'admin'
                ? 'bg-stone-900 text-amber-400 border-stone-800'
                : 'text-stone-600 hover:text-stone-900 border-stone-200/80 hover:bg-stone-100/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
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

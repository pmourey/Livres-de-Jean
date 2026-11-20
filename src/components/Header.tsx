import React from 'react';
import { ShoppingBag, User, Lock, AlertTriangle, Sparkles, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (view: 'catalog' | 'method' | 'ai' | 'author' | 'shipping' | 'legal' | 'account' | 'admin') => void;
  currentView: string;
  isMaintenanceMode?: boolean;
  maintenanceMessage?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onNavigate,
  currentView,
  isMaintenanceMode = true,
  maintenanceMessage,
  theme = 'light',
  onToggleTheme
}) => {
  const isDark = theme === 'dark';

  const navLinkClass = (view: string) =>
    `inline-flex items-center gap-1.5 transition-colors hover:text-[#8B1E2D] pb-1 border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
      currentView === view ? 'border-[#8B1E2D] text-[#8B1E2D] font-semibold' : 'border-transparent'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#17120E]/95 backdrop-blur-md border-b border-[#E7E2D9] dark:border-[#3A2E24] transition-colors">
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

      {/* Tier 1: Brand Identity & Utility Actions (guaranteed zero overlap) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        <button
          onClick={() => onNavigate('catalog')}
          className="font-serif-display text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-[#2B1810] hover:text-[#8B1E2D] transition-colors text-left whitespace-nowrap shrink-0 leading-none cursor-pointer"
        >
          Éditions Émile Mourey
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Passer en mode clair parchemin' : 'Passer en mode sombre sépia'}
              aria-pressed={isDark}
              title={isDark ? 'Mode clair (Parchemin)' : 'Mode sombre sépia (Lecture nocturne)'}
              className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDark
                  ? 'bg-[#2A211A] text-[#E6C687] border-[#4A3C30] hover:bg-[#352A21] hover:text-[#F5DFA9]'
                  : 'bg-[#F5F1E9]/80 text-[#574435] border-[#DFD7CA] hover:bg-[#EDE6DA] hover:text-[#2B1810]'
              }`}
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-[#D4AF37]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#6B4E37]" />
              )}
              <span className="hidden md:inline whitespace-nowrap">
                {isDark ? 'Parchemin' : 'Nuit sépia'}
              </span>
            </button>
          )}

          <button
            onClick={() => onNavigate('admin')}
            title="Espace Auteur & Gestion Commerciale (Accès Protégé)"
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-medium rounded-md transition-colors border whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'admin'
                ? 'bg-stone-900 text-amber-400 border-stone-800'
                : 'text-stone-600 dark:text-[#D8CBB6] hover:text-stone-900 dark:hover:text-[#F3E8D6] border-stone-200/80 dark:border-[#4A3C30] hover:bg-stone-100/60 dark:hover:bg-[#2A211A]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline whitespace-nowrap">Gestion Auteur</span>
          </button>

          <button
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-[#8B1E2D] hover:bg-[#721824] rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Panier</span>
            {cartCount > 0 && (
              <span className="preserve-light bg-white text-[#8B1E2D] px-1.5 py-0.2 rounded-full font-bold text-[11px] tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tier 2: Dedicated Editorial Navigation Bar */}
      <div className="border-t border-[#E7E2D9] dark:border-[#3A2E24] bg-[#FAF8F5] dark:bg-[#1C1611] transition-colors">
        <nav
          aria-label="Navigation principale"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-start lg:justify-center gap-5 lg:gap-7 overflow-x-auto text-xs font-medium text-stone-700 dark:text-[#D8CBB6]"
        >
          <button onClick={() => onNavigate('catalog')} className={navLinkClass('catalog')}>
            Catalogue
          </button>
          <button onClick={() => onNavigate('method')} className={navLinkClass('method')}>
            Méthode & Controverse
          </button>
          <button onClick={() => onNavigate('ai')} className={navLinkClass('ai')}>
            <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D]" />
            <span>Assistant IA</span>
          </button>
          <button onClick={() => onNavigate('author')} className={navLinkClass('author')}>
            L’Auteur & Travaux
          </button>
          <button onClick={() => onNavigate('shipping')} className={navLinkClass('shipping')}>
            Livraison & Paiement
          </button>
          <button onClick={() => onNavigate('legal')} className={navLinkClass('legal')}>
            Charte & Mentions
          </button>
          <button onClick={() => onNavigate('account')} className={navLinkClass('account')}>
            <User className="w-3.5 h-3.5" />
            <span>Espace Client</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

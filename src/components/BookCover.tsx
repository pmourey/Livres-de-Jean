import React from 'react';
import { Book } from '../types';

interface BookCoverProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({
  book,
  size = 'md',
  className = '',
  showBadge = true
}) => {
  const sizeClasses = {
    sm: 'w-24 h-36 text-[9px]',
    md: 'w-44 h-64 text-xs',
    lg: 'w-60 h-88 text-sm',
    xl: 'w-72 h-104 text-base'
  }[size];

  // Render authentic antique SVG motif
  const renderMotif = () => {
    switch (book.motif) {
      case 'shield':
        return (
          <svg className="w-12 h-12 opacity-85" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M32 6L14 12V30C14 44 32 58 32 58C32 58 50 44 50 30V12L32 6Z" fill="currentColor" fillOpacity="0.08" />
            <circle cx="32" cy="28" r="8" strokeDasharray="3 2" />
            <path d="M24 28H40M32 20V36" />
          </svg>
        );
      case 'fortress':
        return (
          <svg className="w-12 h-12 opacity-85" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M12 48V28L20 22V48M44 48V22L52 28V48M20 32H44V48H20V32Z" fill="currentColor" fillOpacity="0.08" />
            <path d="M12 28L20 28M24 22L24 16L32 16L32 22M40 16L40 22M44 28L52 28" />
            <path d="M28 48V40C28 38 36 38 36 40V48" />
          </svg>
        );
      case 'laurel':
        return (
          <svg className="w-12 h-12 opacity-85" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M32 52C22 50 16 36 20 24C22 18 26 14 32 12C38 14 42 18 44 24C48 36 42 50 32 52Z" strokeDasharray="3 3" />
            <path d="M22 28C18 30 14 36 16 42M42 28C46 30 50 36 48 42" />
            <circle cx="32" cy="30" r="3" fill="currentColor" />
          </svg>
        );
      case 'moon':
        return (
          <svg className="w-12 h-12 opacity-85" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M40 14C34 16 30 22 30 29C30 36 34 42 40 44C28 44 20 36 20 29C20 22 28 14 40 14Z" fill="currentColor" fillOpacity="0.12" />
            <polygon points="44,22 46,26 50,26 47,29 48,33 44,30 40,33 41,29 38,26 42,26" fill="currentColor" />
          </svg>
        );
      case 'map':
        return (
          <svg className="w-12 h-12 opacity-85" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
            <polygon points="12,18 24,14 40,18 52,14 52,46 40,50 24,46 12,50" fill="currentColor" fillOpacity="0.08" />
            <line x1="24" y1="14" x2="24" y2="46" strokeDasharray="2 2" />
            <line x1="40" y1="18" x2="40" y2="50" strokeDasharray="2 2" />
          </svg>
        );
      case 'cross':
        return (
          <svg className="w-12 h-12 opacity-85" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M26 10H38V24H52V36H38V54H26V36H12V24H26V10Z" fill="currentColor" fillOpacity="0.08" />
            <circle cx="32" cy="30" r="5" strokeDasharray="2 2" />
          </svg>
        );
      case 'scroll':
        return (
          <svg className="w-12 h-12 opacity-85" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M16 16C16 12 20 10 24 10H48C44 14 44 20 48 24H24C20 24 16 20 16 16Z" />
            <path d="M16 16V48C16 52 20 54 24 54H48C44 50 44 44 48 40H24C20 40 16 44 16 48" />
            <path d="M22 28H40M22 34H36M22 40H38" strokeDasharray="2 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 opacity-85" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="32" cy="32" r="20" />
            <path d="M32 16L35 29L48 32L35 35L32 48L29 35L16 32L29 29Z" fill="currentColor" fillOpacity="0.12" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative select-none shrink-0 rounded-sm shadow-md transition-all duration-300 group-hover:shadow-xl ${sizeClasses} ${className}`}
      style={{
        backgroundColor: book.coverBgColor,
        color: book.coverAccentColor
      }}
    >
      {/* Book spine simulation effect on the left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/45 via-black/20 to-transparent pointer-events-none rounded-l-sm" />
      <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-white/15 pointer-events-none" />

      {/* Book cover inner border frame */}
      <div className="absolute inset-2 border border-current opacity-40 pointer-events-none rounded-[1px]">
        <div className="absolute inset-1 border border-current opacity-20 pointer-events-none" />
      </div>

      {/* Content Layout */}
      <div className="relative h-full flex flex-col justify-between p-3.5 pl-5 text-center">
        {/* Top: Author Name */}
        <div className="pt-1">
          <p className="font-cinzel tracking-[0.2em] uppercase font-bold text-[10px] sm:text-[11px] opacity-90 drop-shadow-sm">
            {book.author}
          </p>
          <div className="w-8 h-[1px] bg-current opacity-40 mx-auto mt-1" />
        </div>

        {/* Center: Title, Motif & Subtitle */}
        <div className="my-auto py-1 flex flex-col items-center">
          <div className="my-1.5 text-current">
            {renderMotif()}
          </div>

          <h3 className="font-serif-display font-bold leading-tight px-1 tracking-tight text-white drop-shadow-md text-sm sm:text-base line-clamp-3">
            {book.title}
          </h3>

          {book.tome && (
            <p className="font-cinzel text-[9px] sm:text-[10px] tracking-widest uppercase font-bold text-amber-300 drop-shadow-sm mt-0.5">
              {book.tome}
            </p>
          )}

          {size !== 'sm' && (
            <p className="font-serif-display italic text-[11px] sm:text-xs text-white/80 mt-1 line-clamp-2 px-1 max-w-[90%]">
              {book.subtitle}
            </p>
          )}
        </div>

        {/* Bottom: Publisher & Year */}
        <div className="pb-1">
          <div className="w-8 h-[1px] bg-current opacity-40 mx-auto mb-1" />
          <p className="font-cinzel text-[8px] sm:text-[9px] uppercase tracking-wider opacity-85">
            {book.publisher}
          </p>
          <p className="text-[8px] text-white/60 tracking-widest mt-0.5">
            {book.publicationYear} · {book.pages} p.
          </p>
        </div>
      </div>

      {/* Featured / Pack / Inédit Badge */}
      {showBadge && book.isUnpublished && (
        <div className="absolute top-2 right-2 bg-stone-900/90 text-amber-300 border border-amber-400/40 font-cinzel font-bold text-[8px] px-1.5 py-0.5 shadow-sm">
          Manuscrit Inédit
        </div>
      )}
      {showBadge && book.originalPrice && !book.isUnpublished && (
        <div className="absolute top-2 right-2 bg-amber-500 text-stone-950 font-cinzel font-bold text-[9px] px-1.5 py-0.5 shadow-sm rounded-none">
          Pack Coffret
        </div>
      )}
    </div>
  );
};

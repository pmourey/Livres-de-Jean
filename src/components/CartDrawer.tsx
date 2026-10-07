import React from 'react';
import { CartItem } from '../types';
import { BookCover } from './BookCover';
import { X, Trash2, ArrowRight, ShoppingBag, Feather, Truck, Scale, FileText, Package, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (bookId: string, format: string, quantity: number) => void;
  onRemoveItem: (bookId: string, format: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1), 0);
  const totalWeight = items.reduce(
    (acc, item) => acc + (item.format === 'numerique_pdf' ? 0 : (Number(item.book?.weightGrams) || 0)) * (Number(item.quantity) || 1),
    0
  );
  const isAllDigital = items.length > 0 && items.every((i) => i.format === 'numerique_pdf');
  const freeShippingThreshold = 55.0;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - (subtotal || 0));
  const freeShippingPercent = Math.min(100, ((subtotal || 0) / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-stone-300 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-stone-200 bg-[#F5F1E9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8B1E2D]" />
              <h3 className="font-serif-display font-bold text-xl text-[#2B1810]">
                Votre Panier
              </h3>
              <span className="text-xs text-stone-500 tabular-nums">
                ({items.reduce((acc, i) => acc + i.quantity, 0)} article{items.length > 1 ? 's' : ''})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-stone-500 hover:text-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shipping / Digital Indicator */}
          {isAllDigital ? (
            <div className="bg-blue-50 px-6 py-3 border-b border-blue-200 text-xs text-blue-900 flex items-center gap-2 font-medium">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Commande 100% numérique : 0 € de livraison, accès PDF immédiat.</span>
            </div>
          ) : (
            <div className="bg-[#EFEAE1] px-6 py-3 border-b border-stone-200 text-xs">
              {missingForFreeShipping > 0 ? (
                <div>
                  <p className="text-stone-700 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#8B1E2D]" />
                    <span>
                      Plus que <strong className="text-[#8B1E2D] font-semibold">{Number(missingForFreeShipping || 0).toFixed(2)} €</strong> pour la livraison Colissimo offerte !
                    </span>
                  </p>
                  <div className="w-full bg-stone-300 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[#8B1E2D] h-full rounded-full transition-all duration-300"
                      style={{ width: `${freeShippingPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Félicitations ! La livraison Colissimo est offerte pour votre commande.</span>
                </div>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 space-y-3">
                <ShoppingBag className="w-12 h-12 text-stone-300 stroke-[1.25]" />
                <p className="font-serif-display text-lg text-stone-700 font-semibold">
                  Votre panier est vide
                </p>
                <p className="text-xs max-w-xs text-stone-500">
                  Parcourez le catalogue d'Émile Mourey pour choisir vos ouvrages en version papier ou en version numérique PDF.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.book.id}-${item.format}`}
                  className="bg-white p-3.5 rounded-md border border-stone-200 shadow-xs flex gap-3.5"
                >
                  <BookCover book={item.book} size="sm" showBadge={false} />

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif-display font-bold text-sm text-[#2B1810] line-clamp-1">
                          {item.book.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.book.id, item.format)}
                          className="text-stone-400 hover:text-red-700 p-0.5 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Format Badge */}
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold">
                        {item.format === 'numerique_pdf' && (
                          <span className="text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-blue-600" /> eBook PDF
                          </span>
                        )}
                        {item.format === 'pack_duo' && (
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" /> Pack Duo Papier + PDF
                          </span>
                        )}
                        {item.format === 'papier' && (
                          <span className="text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 flex items-center gap-1">
                            <Package className="w-3 h-3 text-stone-600" /> Papier Broché
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#8B1E2D] font-bold font-serif-display tabular-nums mt-1">
                        {Number(item.unitPrice || 22.0).toFixed(2)} € <span className="text-[10px] text-stone-400 font-sans">/ unité</span>
                      </p>

                      {/* Dedication indicator */}
                      {item.dedicationRequested && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          <Feather className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            Dédicace : {item.dedicationRecipient || 'Nom sur l’adresse'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-xs">
                      <div className="flex items-center border border-stone-200 rounded">
                        <button
                          onClick={() => onUpdateQuantity(item.book.id, item.format, item.quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-semibold tabular-nums text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.book.id, item.format, item.quantity + 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-semibold text-stone-900 tabular-nums">
                        {((item.unitPrice ?? 22.0) * (item.quantity ?? 1)).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-[#F5F1E9] space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Sous-total articles :</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    {(subtotal ?? 0).toFixed(2)} €
                  </span>
                </div>
                {!isAllDigital && (
                  <div className="flex justify-between items-center text-stone-500">
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" /> Poids total postal estimé :
                    </span>
                    <span className="font-mono tabular-nums">{totalWeight} g</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frais de port :</span>
                  <span className="text-stone-700">
                    {isAllDigital ? 'Offert (Produits numériques)' : 'Calculés à l’étape suivante'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline">
                <span className="font-serif-display text-base font-bold text-[#2B1810]">
                  Total indicatif :
                </span>
                <span className="font-serif-display text-2xl font-bold text-[#8B1E2D] tabular-nums">
                  {(subtotal ?? 0).toFixed(2)} €
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#8B1E2D] hover:bg-[#721824] text-white font-semibold text-sm rounded-md shadow-md transition-colors"
              >
                <span>Passer la commande sécurisée</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-stone-500">
                Paiement direct sécurisé : Carte Bancaire, PayPal ou Chèque postal
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

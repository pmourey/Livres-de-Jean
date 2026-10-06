import React from 'react';
import { Order } from '../types';
import { AUTHOR_INFO } from '../data/initialData';
import { Printer, X, Truck } from 'lucide-react';

interface ShippingLabelViewProps {
  order: Order;
  onClose: () => void;
}

export const ShippingLabelView: React.FC<ShippingLabelViewProps> = ({ order, onClose }) => {
  const trackingNumber = order.trackingNumber || `8V01${Math.floor(100000000 + Math.random() * 900000000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-2xl border border-stone-300 overflow-hidden my-6">
        {/* Top actions */}
        <div className="px-6 py-3 bg-stone-100 border-b border-stone-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-stone-700" />
            <span className="font-semibold text-xs text-stone-800">
              Bordereau d'expédition Colissimo La Poste
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer l'étiquette</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Label */}
        <div id="printable-document" className="p-8 bg-white border-2 border-dashed border-stone-400 m-4 rounded font-sans text-xs space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-stone-900 pb-3">
            <div className="flex items-center gap-2">
              <div className="bg-amber-400 text-stone-950 font-black px-2 py-1 text-sm tracking-wider">
                LA POSTE
              </div>
              <span className="font-bold text-sm tracking-tight">COLISSIMO FRANCE</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-sm">{trackingNumber}</span>
              <p className="text-[10px] text-stone-500">Poids : {order.totalWeightGrams} g</p>
            </div>
          </div>

          {/* Sender & Receiver Boxes */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sender */}
            <div className="p-3 bg-stone-50 border border-stone-300 rounded text-[11px] space-y-1">
              <span className="text-[9px] uppercase font-bold text-stone-400 block">
                Expéditeur :
              </span>
              <p className="font-bold text-stone-900">Éditions Émile Mourey</p>
              <p className="text-stone-700">71200 Le Creusot</p>
              <p className="text-stone-600">France (Bourgogne)</p>
              <p className="text-[10px] text-stone-400 font-mono">SIREN : {AUTHOR_INFO.siren}</p>
            </div>

            {/* Recipient */}
            <div className="p-4 bg-stone-100 border-2 border-stone-800 rounded text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                Destinataire :
              </span>
              <p className="font-bold text-sm text-stone-900">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="text-stone-800">{order.customer.street}</p>
              <p className="text-stone-900 font-bold text-sm">
                {order.customer.postalCode} {order.customer.city}
              </p>
              <p className="text-stone-700 font-semibold">{order.customer.country}</p>
              <p className="text-stone-500 text-[10px] pt-1">Tél : {order.customer.phone}</p>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="p-4 bg-white border border-stone-200 rounded text-center space-y-2">
            <div className="font-mono text-[9px] text-stone-400 tracking-[0.3em] select-none">
              ||| | ||||| |||| || |||||| | ||||| || |||||||| | |||| ||||| ||
              ||| | ||||| |||| || |||||| | ||||| || |||||||| | |||| ||||| ||
              ||| | ||||| |||| || |||||| | ||||| || |||||||| | |||| ||||| ||
            </div>
            <p className="font-mono font-bold text-xs tracking-wider text-stone-800">
              * {trackingNumber} *
            </p>
            <p className="text-[10px] text-stone-500">
              Réf Commande : {order.id} · {order.items.length} livre(s)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

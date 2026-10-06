import React from 'react';
import { Order } from '../types';
import { AUTHOR_INFO } from '../data/initialData';
import { Printer, Download, X, ShieldCheck } from 'lucide-react';

interface InvoiceViewProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order, onClose }) => {
  const invoiceNumber = order.invoiceNumber || `FAC-${order.id.replace('CMD-', '')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl border border-stone-300 overflow-hidden my-6">
        {/* Actions bar (not printed) */}
        <div className="px-6 py-3.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-serif-display font-bold text-stone-900 text-sm">
              Facture Officielle #{invoiceNumber}
            </span>
            <span className="text-xs text-stone-500">· Vente de livres d'histoire</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-semibold rounded shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-document" className="p-8 sm:p-12 text-[#22211F] bg-white text-xs font-sans space-y-8">
          {/* Header Zone: Seller & Buyer */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-stone-200 pb-8">
            {/* Seller Details */}
            <div className="space-y-1.5">
              <h2 className="font-serif-display text-2xl font-bold text-[#2B1810]">
                Éditions Émile Mourey
              </h2>
              <p className="font-semibold text-stone-800">{AUTHOR_INFO.name}</p>
              <p className="text-stone-600">Auteur & Chercheur Historique</p>
              <p className="text-stone-600">{AUTHOR_INFO.postalAddress}</p>
              <p className="text-stone-500 font-mono text-[11px] pt-1">
                SIREN : {AUTHOR_INFO.siren} · Code APE : {AUTHOR_INFO.activityCode}
              </p>
              <p className="text-stone-500 text-[11px]">
                Domiciliation bancaire : {AUTHOR_INFO.bankAffiliation}
              </p>
            </div>

            {/* Buyer Details */}
            <div className="sm:text-right bg-stone-50 p-4 rounded border border-stone-200 min-w-[240px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                Facturé à :
              </span>
              <p className="font-bold text-sm text-stone-900 mt-1">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="text-stone-700">{order.customer.street}</p>
              <p className="text-stone-700">
                {order.customer.postalCode} {order.customer.city}
              </p>
              <p className="text-stone-600">{order.customer.country}</p>
              <p className="text-stone-500 text-[11px] mt-1">{order.customer.email}</p>
            </div>
          </div>

          {/* Invoice Meta details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FAF8F5] p-4 rounded border border-stone-200 text-stone-700">
            <div>
              <span className="text-[10px] text-stone-500 uppercase block">Facture N°</span>
              <span className="font-bold font-mono text-stone-900">{invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase block">Date d'émission</span>
              <span className="font-medium text-stone-900">{order.date}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase block">Commande N°</span>
              <span className="font-mono text-stone-900">{order.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase block">Règlement</span>
              <span className="font-medium text-stone-900 capitalize">
                {order.paymentMethod === 'stripe_card'
                  ? 'Carte Bancaire'
                  : order.paymentMethod === 'paypal'
                  ? 'PayPal'
                  : 'Chèque postal'}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-300 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                <th className="py-2.5">Désignation des ouvrages</th>
                <th className="py-2.5 text-center">Qté</th>
                <th className="py-2.5 text-right">Prix Unitaire</th>
                <th className="py-2.5 text-right">Total Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {order.items.map((item, idx) => (
                <tr key={idx} className="py-3">
                  <td className="py-3 pr-2">
                    <p className="font-semibold text-stone-900">{item.title}</p>
                    <p className="text-[11px] text-stone-500">
                      Édition reliée brochée par l'auteur · {item.weightGrams} g
                    </p>
                    {item.dedicationRequested && (
                      <p className="text-[10px] text-[#8B1E2D] italic mt-0.5">
                        Dédicace manuscrite personnalisée de l’auteur offerte
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-center tabular-nums font-mono">{item.quantity}</td>
                  <td className="py-3 text-right tabular-nums">{(item.unitPrice ?? 0).toFixed(2)} €</td>
                  <td className="py-3 text-right tabular-nums font-semibold">
                    {((item.unitPrice ?? 0) * (item.quantity ?? 1)).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Taxes calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-stone-200 pt-6">
            <div className="text-[11px] text-stone-500 max-w-sm space-y-1">
              <p className="font-semibold text-stone-700">Mentions légales obligatoires :</p>
              <p>• {AUTHOR_INFO.tvaStatus}</p>
              <p>• Prix unique du livre garanti par la Loi Lang n° 81-766 du 10 août 1981.</p>
              <p>• {AUTHOR_INFO.registrationStatus}</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-stone-700 text-xs">
              <div className="flex justify-between">
                <span>Sous-total ouvrages :</span>
                <span className="tabular-nums font-semibold">{(order.subtotal ?? 0).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de port et emballage :</span>
                <span className="tabular-nums font-semibold">
                  {order.shippingCost === 0 ? 'Offert' : `${(order.shippingCost ?? 0).toFixed(2)} €`}
                </span>
              </div>
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>TVA (Art. 293 B CGI) :</span>
                <span className="tabular-nums font-mono">0,00 €</span>
              </div>
              <div className="border-t-2 border-stone-900 pt-2 flex justify-between items-baseline font-bold text-sm text-[#2B1810]">
                <span>Net à Payer :</span>
                <span className="font-serif-display text-xl text-[#8B1E2D] tabular-nums">
                  {(order.total ?? 0).toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-stone-200 pt-6 text-center text-[10px] text-stone-400 space-y-0.5">
            <p className="font-serif-display italic text-stone-600 text-xs">
              « Merci pour votre intérêt pour l'histoire antique et le patrimoine de la Bourgogne. »
            </p>
            <p>Éditions Émile Mourey · SIREN 418 122 883 · Domiciliation La Banque Postale</p>
          </div>
        </div>
      </div>
    </div>
  );
};

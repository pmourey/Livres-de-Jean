import React from 'react';
import { Order } from '../types';
import { AUTHOR_INFO } from '../data/initialData';
import { CheckCircle, Printer, FileText, ArrowRight, ShieldCheck, Download, Lock, BookOpen, MapPin } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order;
  onClose: () => void;
  onGoToAccount: () => void;
  onGoToDigitalLibrary?: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onGoToAccount,
  onGoToDigitalLibrary
}) => {
  const isCheque = order.paymentMethod === 'cheque_postal';
  const hasDigitalItems = order.items.some(
    (i) => i.format === 'numerique_pdf' || i.format === 'pack_duo'
  );
  const isPaid = order.paymentStatus === 'paye';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-6 bg-[#F5F1E9] border-b border-stone-200 text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h3 className="font-serif-display font-bold text-2xl text-[#2B1810]">
            Merci pour votre commande !
          </h3>
          <p className="text-xs text-stone-600">
            Référence officielle de transaction : <strong className="font-mono text-stone-900">{order.id}</strong>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-5 text-xs text-stone-700">
          {/* Status highlight */}
          {isCheque ? (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Paiement par chèque postal La Banque Postale en attente</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Votre commande est enregistrée et vos exemplaires papier réservés pendant 10 jours. Conformément aux règles de la boutique, l'expédition postale Colissimo et l'accès aux versions numériques seront activés dès réception et validation manuelle du chèque par Monsieur Émile Mourey.
              </p>
              <div className="bg-white p-3 rounded border border-amber-200 mt-2 space-y-1 text-stone-800">
                <p><strong>À l'ordre de :</strong> {AUTHOR_INFO.name}</p>
                <p><strong>Montant exact :</strong> {(order.total ?? 0).toFixed(2)} €</p>
                <p><strong>Au dos du chèque :</strong> Inscrire la référence <code>{order.id}</code></p>
                <p><strong>Adresse d'envoi :</strong> {AUTHOR_INFO.postalAddress}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 text-sm block">Paiement sécurisé validé avec succès</strong>
                <p className="text-emerald-900 mt-0.5 leading-relaxed">
                  Votre règlement de <strong>{(order.total ?? 0).toFixed(2)} €</strong> a été encaissé. Monsieur Émile Mourey prépare personnellement votre colis avec les dédicaces demandées.
                </p>
              </div>
            </div>
          )}

          {/* Digital access callout if order contains digital items */}
          {hasDigitalItems && (
            <div className={`p-4 rounded-lg border space-y-2 ${
              isPaid ? 'bg-blue-50/80 border-blue-200 text-blue-950' : 'bg-stone-100 border-stone-200 text-stone-700'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {isPaid ? (
                  <>
                    <BookOpen className="w-4 h-4 text-blue-700" />
                    <span>Vos livres numériques (eBooks PDF) sont immédiatement disponibles !</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-stone-500" />
                    <span>Accès aux versions numériques sécurisées</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed">
                {isPaid
                  ? "Vos fichiers PDF haute résolution et la liseuse en ligne ont été activés dans votre Espace Client. Vous pouvez les consulter et les télécharger sans attendre."
                  : "Dès validation de votre paiement par l'auteur, vos fichiers PDF seront immédiatement téléchargeables dans votre Espace Client."}
              </p>
              {isPaid && onGoToDigitalLibrary && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      onGoToDigitalLibrary();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded text-xs shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Accéder directement à mes eBooks PDF</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delivery & Items summary */}
          <div className="bg-white p-4 rounded-md border border-stone-200 space-y-3">
            <h4 className="font-serif-display font-bold text-sm text-[#2B1810] border-b border-stone-100 pb-1.5">
              Détail de votre commande
            </h4>
            <div className="space-y-1.5">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-stone-900">{i.quantity}× {i.title}</span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded">
                      {i.format === 'numerique_pdf' ? 'eBook PDF' : i.format === 'pack_duo' ? 'Duo Papier + PDF' : 'Papier broché'}
                    </span>
                    {i.dedicationRequested && (
                      <span className="ml-1 text-[10px] text-[#8B1E2D] italic">
                        (Dédicacé par l'auteur)
                      </span>
                    )}
                  </div>
                  <span className="font-medium tabular-nums text-stone-800">
                    {((i.unitPrice ?? 0) * (i.quantity ?? 1)).toFixed(2)} €
                  </span>
                </div>
              ))}
              <div className="border-t border-stone-100 pt-1 flex justify-between font-bold text-stone-900">
                <span>Total TTC :</span>
                <span className="text-[#8B1E2D] font-serif-display text-base tabular-nums">
                  {(order.total ?? 0).toFixed(2)} €
                </span>
              </div>
            </div>

            {order.shippingMethod !== 'telechargement_numerique' && (
              <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  Livraison postale à : <strong>{order.customer.firstName} {order.customer.lastName}</strong>, {order.customer.street}, {order.customer.postalCode} {order.customer.city}.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-[#F5F1E9] border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-stone-300 rounded text-xs font-medium text-stone-700 hover:bg-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer le récapitulatif</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToAccount();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-semibold rounded shadow transition-colors"
          >
            <span>Accéder à mon Espace Client</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

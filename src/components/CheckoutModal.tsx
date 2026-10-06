import React, { useState } from 'react';
import { CartItem, ShippingMethodId, PaymentMethodType, RelayPoint, Order, UserAccount, CustomerAddress } from '../types';
import { RelayPointPicker } from './RelayPointPicker';
import { INITIAL_RELAY_POINTS, AUTHOR_INFO } from '../data/initialData';
import { 
  X, Check, Lock, ShieldCheck, CreditCard, ArrowRight, ArrowLeft, 
  Truck, MapPin, Building, FileText, AlertCircle, Sparkles 
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: UserAccount | null;
  onOrderCreated: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onOrderCreated
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Client/Adresse, 2: Livraison, 3: Paiement
  const [isProcessing, setIsProcessing] = useState(false);
  const [show3DSecureModal, setShow3DSecureModal] = useState(false);

  // Step 1: Customer details
  const [address, setAddress] = useState<CustomerAddress>({
    firstName: currentUser?.firstName || 'Philippe',
    lastName: currentUser?.lastName || 'Mourey',
    email: currentUser?.email || 'philippe.mourey@gmail.com',
    phone: currentUser?.phone || '06 12 34 56 78',
    street: currentUser?.shippingAddress?.street || '18 Rue des Éduens',
    postalCode: currentUser?.shippingAddress?.postalCode || '71200',
    city: currentUser?.shippingAddress?.city || 'Le Creusot',
    country: currentUser?.shippingAddress?.country || 'France'
  });
  const [password, setPassword] = useState('secret123');
  const [differentBilling, setDifferentBilling] = useState(false);

  // Step 2: Shipping
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>('colissimo_standard');
  const [selectedRelay, setSelectedRelay] = useState<RelayPoint | undefined>(INITIAL_RELAY_POINTS[0]);

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('stripe_card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('842');
  const [cardHolder, setCardHolder] = useState(`${address.firstName} ${address.lastName}`);

  // Calculations
  const isAllDigital = items.length > 0 && items.every((i) => i.format === 'numerique_pdf');
  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const totalWeightGrams = items.reduce(
    (acc, i) => acc + (i.format === 'numerique_pdf' ? 0 : i.book.weightGrams) * i.quantity,
    0
  );

  // Shipping cost logic
  const calculateShippingCost = (): number => {
    if (isAllDigital) return 0.0;
    // Free shipping threshold
    if (subtotal >= 55.0) {
      if (shippingMethod === 'colissimo_signature') return 2.50; // Just the signature extra
      return 0.0;
    }

    switch (shippingMethod) {
      case 'colissimo_standard':
        if (totalWeightGrams <= 500) return 4.95;
        if (totalWeightGrams <= 1000) return 6.95;
        return 8.95;
      case 'colissimo_signature':
        if (totalWeightGrams <= 500) return 6.95;
        if (totalWeightGrams <= 1000) return 8.95;
        return 10.95;
      case 'point_relais':
        return 3.90;
      case 'retrait_auteur':
        return 0.0;
      case 'telechargement_numerique':
        return 0.0;
      default:
        return 5.90;
    }
  };

  const shippingCost = calculateShippingCost();
  const grandTotal = subtotal + shippingCost;

  // Finalize order
  const handleCompleteOrder = (method: PaymentMethodType) => {
    setIsProcessing(true);

    const orderNumber = `CMD-2026-0${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: orderNumber,
      date: new Date().toISOString().split('T')[0],
      customer: { ...address },
      items: items.map(item => ({
        bookId: item.book.id,
        title: item.book.title,
        format: item.format,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        weightGrams: item.format === 'numerique_pdf' ? 0 : item.book.weightGrams,
        dedicationRequested: item.format !== 'numerique_pdf' && item.dedicationRequested,
        dedicationRecipient: item.dedicationRecipient,
        dedicationMessage: item.dedicationMessage,
        digitalPdfUrl: item.book.digitalPdfUrl
      })),
      subtotal,
      shippingMethod: isAllDigital ? 'telechargement_numerique' : shippingMethod,
      shippingCost,
      total: grandTotal,
      totalWeightGrams,
      paymentMethod: method,
      paymentStatus: method === 'cheque_postal' || method === 'virement_bancaire' ? 'en_attente' : 'paye',
      orderStatus: method === 'cheque_postal' 
        ? 'attente_cheque' 
        : method === 'virement_bancaire'
        ? 'attente_virement'
        : isAllDigital
        ? 'livree' // Instant delivery for digital!
        : 'payee',
      selectedRelayPoint: shippingMethod === 'point_relais' ? selectedRelay : undefined,
      notes: isAllDigital
        ? 'Commande 100% numérique payée en ligne. Téléchargements activés.'
        : method === 'cheque_postal' 
        ? 'Chèque postal à l’ordre d’Émile Mourey à adresser par courrier.' 
        : 'Paiement en ligne sécurisé validé.'
    };

    setTimeout(() => {
      setIsProcessing(false);
      onOrderCreated(newOrder);
      onClose();
    }, 1200);
  };

  const handleCardPayment = () => {
    // Trigger simulated 3D Secure verification
    setShow3DSecureModal(true);
  };

  const confirm3DSecure = () => {
    setShow3DSecureModal(false);
    handleCompleteOrder('stripe_card');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-4xl rounded-lg shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header with Steps */}
        <div className="px-6 py-4 border-b border-stone-200 bg-[#F5F1E9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-[#8B1E2D]" />
            <h3 className="font-serif-display font-bold text-lg text-[#2B1810]">
              Tunnel de Commande Sécurisé
            </h3>
          </div>

          {/* Stepper Tabs */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded font-medium ${step === 1 ? 'bg-[#8B1E2D] text-white' : 'text-stone-500'}`}>
              1. Coordonnées
            </span>
            <span>→</span>
            <span className={`px-2.5 py-1 rounded font-medium ${step === 2 ? 'bg-[#8B1E2D] text-white' : 'text-stone-500'}`}>
              2. Livraison
            </span>
            <span>→</span>
            <span className={`px-2.5 py-1 rounded font-medium ${step === 3 ? 'bg-[#8B1E2D] text-white' : 'text-stone-500'}`}>
              3. Paiement
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:text-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Form (Left 8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* STEP 1: Customer Account & Address */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif-display font-bold text-base text-[#2B1810]">
                        Coordonnées & Espace Client
                      </h4>
                      <p className="text-xs text-stone-500">
                        Votre compte vous permettra de suivre l'expédition Colissimo et télécharger votre facture.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={address.firstName}
                        onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                        required
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={address.lastName}
                        onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                        required
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Adresse e-mail *
                      </label>
                      <input
                        type="email"
                        value={address.email}
                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                        required
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Téléphone (pour le transporteur) *
                      </label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        required
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Adresse de livraison (Rue, N° et complément) *
                    </label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      required
                      placeholder="Ex : 18 Rue des Éduens"
                      className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Code Postal *
                      </label>
                      <input
                        type="text"
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        required
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Ville *
                      </label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        required
                        className="w-full text-xs px-3 py-2 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                      />
                    </div>
                  </div>

                  {/* Account Creation Password */}
                  <div className="p-3 bg-stone-100 rounded border border-stone-200">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Mot de passe du compte client (crypté et sécurisé)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-white border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      Ce mot de passe protège votre espace personnel et l'accès à vos factures.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1E2D] text-white text-xs font-semibold rounded hover:bg-[#721824] transition-colors"
                    >
                      <span>Continuer vers la livraison</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Shipping Method */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-stone-200 pb-2">
                    <h4 className="font-serif-display font-bold text-base text-[#2B1810]">
                      Choix du Mode de Livraison
                    </h4>
                    <p className="text-xs text-stone-500">
                      {isAllDigital
                        ? 'Commande 100% numérique · Aucun colis physique à expédier'
                        : `Poids total postal : ${totalWeightGrams} g · Emballage renforcé sous carton rigide`}
                    </p>
                  </div>

                  {isAllDigital ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-2">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                        <FileText className="w-5 h-5 text-blue-700" />
                        <span>Téléchargement Numérique Immédiat (0,00 €)</span>
                      </div>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Votre commande contient exclusivement des ouvrages au format numérique (eBook PDF). Aucun frais d'expédition postale ne vous est facturé. Vos boutons de téléchargement sécurisés s'activeront dans votre Espace Client dès confirmation du paiement.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Option 1: Colissimo standard */}
                      <label
                        className={`block p-3.5 rounded-md border cursor-pointer transition-colors ${
                          shippingMethod === 'colissimo_standard'
                            ? 'border-[#8B1E2D] bg-[#8B1E2D]/5 ring-1 ring-[#8B1E2D]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              checked={shippingMethod === 'colissimo_standard'}
                              onChange={() => setShippingMethod('colissimo_standard')}
                              className="mt-1 text-[#8B1E2D] focus:ring-[#8B1E2D]"
                            />
                            <div>
                              <p className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-[#8B1E2D]" />
                                Colissimo La Poste à Domicile (sans signature)
                              </p>
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                Livraison directe en boîte aux lettres sous 48h ouvrées avec numéro de suivi.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold font-serif-display text-stone-900 tabular-nums">
                            {subtotal >= 55 ? (
                              <span className="text-emerald-700 font-semibold">Offert</span>
                            ) : (
                              `${(totalWeightGrams <= 500 ? 4.95 : totalWeightGrams <= 1000 ? 6.95 : 8.95).toFixed(2)} €`
                            )}
                          </span>
                        </div>
                      </label>

                      {/* Option 2: Colissimo avec signature */}
                      <label
                        className={`block p-3.5 rounded-md border cursor-pointer transition-colors ${
                          shippingMethod === 'colissimo_signature'
                            ? 'border-[#8B1E2D] bg-[#8B1E2D]/5 ring-1 ring-[#8B1E2D]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              checked={shippingMethod === 'colissimo_signature'}
                              onChange={() => setShippingMethod('colissimo_signature')}
                              className="mt-1 text-[#8B1E2D] focus:ring-[#8B1E2D]"
                            />
                            <div>
                              <p className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                                Colissimo Recommandé avec remise contre signature
                              </p>
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                Remise en mains propres sécurisée avec assurance perte/avarie incluse.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold font-serif-display text-stone-900 tabular-nums">
                            {subtotal >= 55 ? '2.50 €' : `${(totalWeightGrams <= 500 ? 6.95 : totalWeightGrams <= 1000 ? 8.95 : 10.95).toFixed(2)} €`}
                          </span>
                        </div>
                      </label>

                      {/* Option 3: Point Relais avec carte interactive */}
                      <div
                        className={`p-3.5 rounded-md border transition-colors ${
                          shippingMethod === 'point_relais'
                            ? 'border-[#8B1E2D] bg-[#8B1E2D]/5 ring-1 ring-[#8B1E2D]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <label className="flex items-start justify-between cursor-pointer">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              checked={shippingMethod === 'point_relais'}
                              onChange={() => setShippingMethod('point_relais')}
                              className="mt-1 text-[#8B1E2D] focus:ring-[#8B1E2D]"
                            />
                            <div>
                              <p className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-stone-700" />
                                Point Relais (La Poste Pickup / Mondial Relay)
                              </p>
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                Retrait commerçant sous 3 à 4 jours ouvrés.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold font-serif-display text-stone-900 tabular-nums">
                            {subtotal >= 55 ? <span className="text-emerald-700">Offert</span> : '3.90 €'}
                          </span>
                        </label>

                        {shippingMethod === 'point_relais' && (
                          <RelayPointPicker
                            relayPoints={INITIAL_RELAY_POINTS}
                            selectedPoint={selectedRelay}
                            onSelect={setSelectedRelay}
                            defaultPostalCode={address.postalCode}
                          />
                        )}
                      </div>

                      {/* Option 4: Retrait gratuit chez l'auteur */}
                      <label
                        className={`block p-3.5 rounded-md border cursor-pointer transition-colors ${
                          shippingMethod === 'retrait_auteur'
                            ? 'border-[#8B1E2D] bg-[#8B1E2D]/5 ring-1 ring-[#8B1E2D]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              checked={shippingMethod === 'retrait_auteur'}
                              onChange={() => setShippingMethod('retrait_auteur')}
                              className="mt-1 text-[#8B1E2D] focus:ring-[#8B1E2D]"
                            />
                            <div>
                              <p className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-stone-700" />
                                Retrait gratuit en Saône-et-Loire (71)
                              </p>
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                Remise en mains propres par Monsieur Émile Mourey sur rendez-vous au Creusot / Autun.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 tabular-nums">
                            Gratuit (0,00 €)
                          </span>
                        </div>
                      </label>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Modifier mes coordonnées</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1E2D] text-white text-xs font-semibold rounded hover:bg-[#721824] transition-colors"
                    >
                      <span>Passer au paiement</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment Gateways */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="border-b border-stone-200 pb-2">
                    <h4 className="font-serif-display font-bold text-base text-[#2B1810]">
                      Choix du Moyen de Paiement Sécurisé
                    </h4>
                    <p className="text-xs text-stone-500">
                      Transactions protégées par cryptage SSL 256 bits · Domiciliation bancaire à La Banque Postale
                    </p>
                  </div>

                  {/* Payment method selector tabs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe_card')}
                      className={`p-3 rounded-md border text-left transition-all ${
                        paymentMethod === 'stripe_card'
                          ? 'border-[#8B1E2D] bg-[#8B1E2D]/5 ring-1 ring-[#8B1E2D]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#8B1E2D]" />
                        <span className="text-xs font-bold text-stone-900">Carte Bancaire</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">
                        Visa, Mastercard, CB via Stripe 3DS
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3 rounded-md border text-left transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-[#0070BA] bg-sky-50 ring-1 ring-[#0070BA]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#003087] text-xs tracking-tight">Pay</span>
                        <span className="font-black text-[#0079C1] text-xs tracking-tight -ml-1">Pal</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">
                        Paiement direct en 1 clic ou carte via PayPal
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cheque_postal')}
                      className={`p-3 rounded-md border text-left transition-all ${
                        paymentMethod === 'cheque_postal'
                          ? 'border-amber-700 bg-amber-50/60 ring-1 ring-amber-700'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-800" />
                        <span className="text-xs font-bold text-stone-900">Chèque Postal</span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">
                        La Banque Postale (bon à imprimer)
                      </p>
                    </button>
                  </div>

                  {/* Payment Gateway 1: Stripe Credit Card */}
                  {paymentMethod === 'stripe_card' && (
                    <div className="bg-white p-4.5 rounded-md border border-stone-200 space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" /> Passerelle Stripe sécurisée
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCardNumber('4242 4242 4242 4242');
                            setCardExpiry('12/28');
                            setCardCvc('842');
                          }}
                          className="text-[10px] text-[#8B1E2D] hover:underline font-medium"
                        >
                          Remplir carte de test (4242...)
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">
                          Numéro de carte bancaire
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full text-xs font-mono px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-stone-600 mb-1">
                            Date d'expiration
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/AA"
                            className="w-full text-xs font-mono px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-stone-600 mb-1">
                            Cryptogramme (CVC)
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="CVC"
                            className="w-full text-xs font-mono px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">
                          Nom inscrit sur la carte
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleCardPayment}
                        disabled={isProcessing}
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-bold rounded shadow transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Payer {grandTotal.toFixed(2)} € par Carte Bancaire</span>
                      </button>
                    </div>
                  )}

                  {/* Payment Gateway 2: PayPal Checkout */}
                  {paymentMethod === 'paypal' && (
                    <div className="bg-sky-50/50 p-4.5 rounded-md border border-sky-200 space-y-3.5">
                      <div className="text-center py-2">
                        <div className="inline-flex items-center gap-1 text-lg font-black tracking-tight text-[#003087]">
                          <span>Pay</span>
                          <span className="text-[#0079C1] -ml-0.5">Pal</span>
                          <span className="text-xs font-medium text-stone-500 ml-2">Checkout Officiel</span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                          Vous allez régler sur le compte PayPal officiel de l'auteur Émile Mourey. Validation immédiate de votre commande.
                        </p>
                      </div>

                      <div className="p-3 bg-white rounded border border-sky-100 text-xs text-stone-700 space-y-1">
                        <div className="flex justify-between">
                          <span>Bénéficiaire :</span>
                          <span className="font-semibold">{AUTHOR_INFO.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Montant débité :</span>
                          <span className="font-bold text-[#0079C1] tabular-nums">{grandTotal.toFixed(2)} €</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCompleteOrder('paypal')}
                        disabled={isProcessing}
                        className="w-full py-3 bg-[#FFC439] hover:bg-[#F4B41A] text-[#111] text-xs font-bold rounded shadow transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="font-black text-[#003087]">Pay</span>
                        <span className="font-black text-[#0079C1] -ml-1">Pal</span>
                        <span>· Régler {grandTotal.toFixed(2)} €</span>
                      </button>
                    </div>
                  )}

                  {/* Payment Gateway 3: Chèque Postal La Banque Postale */}
                  {paymentMethod === 'cheque_postal' && (
                    <div className="bg-amber-50/60 p-4.5 rounded-md border border-amber-200/90 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-amber-950">
                            Paiement par chèque postal (La Banque Postale)
                          </h5>
                          <p className="text-xs text-amber-900/90 mt-0.5">
                            Conformément au cahier des charges, votre commande passera en statut <em>« En attente de paiement »</em>. L’expédition sera débloquée dès réception du chèque par l’auteur.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded border border-amber-200 text-xs space-y-2">
                        <div className="font-semibold text-stone-900 border-b border-stone-100 pb-1">
                          Instructions pour l'établissement du chèque :
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Ordre du chèque :</span>
                          <strong className="text-stone-900">{AUTHOR_INFO.name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Montant exact :</span>
                          <strong className="text-[#8B1E2D] tabular-nums">{Number(grandTotal || 0).toFixed(2)} €</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Établissement :</span>
                          <span className="text-stone-700">La Banque Postale</span>
                        </div>
                        <div className="pt-1 text-[11px] text-stone-600">
                          Adresse d'expédition : <br />
                          <strong>Éditions Émile Mourey</strong><br />
                          71200 Le Creusot (Bourgogne - Saône-et-Loire, France)
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCompleteOrder('cheque_postal')}
                        disabled={isProcessing}
                        className="w-full py-3 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded shadow transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Valider ma commande et éditer le bon de commande chèque</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Modifier le mode de livraison</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar (Right 4 cols) */}
            <div className="lg:col-span-4 bg-[#F5F1E9] p-4.5 rounded-md border border-stone-200 text-xs space-y-3.5 h-fit">
              <h4 className="font-serif-display font-bold text-sm text-[#2B1810] border-b border-stone-200 pb-1.5">
                Récapitulatif de la commande
              </h4>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={`${i.book.id}-${i.format}`} className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-stone-900 line-clamp-1">{i.book.title}</p>
                      <p className="text-[10px] text-stone-500">
                        {i.format === 'numerique_pdf'
                          ? 'eBook Numérique (PDF)'
                          : i.format === 'pack_duo'
                          ? 'Pack Duo (Papier + PDF)'
                          : `Livre Papier (${i.book.weightGrams}g)`}{' '}
                        · Qté : {i.quantity}
                      </p>
                      {i.dedicationRequested && (
                        <p className="text-[10px] text-[#8B1E2D] italic">
                          Dédicacé pour {i.dedicationRecipient || 'le destinataire'}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold tabular-nums text-stone-800 shrink-0">
                      {((i.unitPrice ?? 0) * (i.quantity ?? 1)).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-200 space-y-1.5 text-stone-600">
                <div className="flex justify-between">
                  <span>Sous-total articles :</span>
                  <span className="tabular-nums font-semibold text-stone-900">{Number(subtotal || 0).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de livraison :</span>
                  <span className="tabular-nums font-semibold text-stone-900">
                    {shippingCost === 0 ? <span className="text-emerald-700">Offert</span> : `${Number(shippingCost || 0).toFixed(2)} €`}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>Poids total du colis :</span>
                  <span className="font-mono tabular-nums">{totalWeightGrams} g</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-300 flex justify-between items-baseline">
                <span className="font-serif-display text-base font-bold text-[#2B1810]">Total à payer :</span>
                <span className="font-serif-display text-2xl font-bold text-[#8B1E2D] tabular-nums">
                  {Number(grandTotal || 0).toFixed(2)} €
                </span>
              </div>

              <div className="bg-white/80 p-2.5 rounded border border-stone-200 text-[10px] text-stone-500 space-y-1">
                <p className="flex items-center gap-1 text-stone-700 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Vente directe auteur
                </p>
                <p>N° SIREN : {AUTHOR_INFO.siren}</p>
                <p>TVA non applicable, art. 293 B du CGI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Secure Simulation Modal */}
      {show3DSecureModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-sm w-full p-6 rounded-lg shadow-2xl border border-stone-300 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto border border-blue-200">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">
                Authentification 3D Secure (Stripe)
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                Validation bancaire pour le paiement de <strong>{grandTotal.toFixed(2)} €</strong> auprès des Éditions Émile Mourey.
              </p>
            </div>
            <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs text-stone-600 text-left space-y-1">
              <div>Commerçant : <strong>Émile Mourey Éditions</strong></div>
              <div>Banque émettrice : <strong>La Banque Postale / CB</strong></div>
              <div>Code de confirmation : <strong className="font-mono text-blue-700">842-911</strong></div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShow3DSecureModal(false)}
                className="flex-1 py-2 text-xs border border-stone-300 rounded text-stone-600 hover:bg-stone-50"
              >
                Annuler
              </button>
              <button
                onClick={confirm3DSecure}
                className="flex-1 py-2 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded shadow transition-colors"
              >
                Confirmer l'achat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

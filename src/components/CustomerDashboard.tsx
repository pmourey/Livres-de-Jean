import React, { useState } from 'react';
import { Order, ClaimTicket, UserAccount, Book } from '../types';
import { InvoiceView } from './InvoiceView';
import { BookCover } from './BookCover';
import { EBookReaderModal } from './EBookReaderModal';
import { 
  Package, Clock, CheckCircle, Truck, FileText, AlertTriangle, 
  Send, ChevronRight, User, MapPin, Feather, Lock, Eye, X, 
  ExternalLink, Download, BookOpen, ShieldCheck, Sparkles 
} from 'lucide-react';

interface CustomerDashboardProps {
  orders: Order[];
  claims: ClaimTicket[];
  currentUser: UserAccount;
  books: Book[];
  onOpenClaim: (orderId: string, reason: ClaimTicket['reason'], subject: string, message: string) => void;
  onSendClaimMessage: (claimId: string, text: string) => void;
  onViewBook: (bookId: string) => void;
  onNavigateCatalog?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  orders,
  claims,
  currentUser,
  books,
  onOpenClaim,
  onSendClaimMessage,
  onViewBook,
  onNavigateCatalog
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'digital' | 'claims' | 'profile'>('orders');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [readingDigitalBook, setReadingDigitalBook] = useState<{ book: Book; order: Order } | null>(null);

  // Claim modal state
  const [claimModalOrderId, setClaimModalOrderId] = useState<string | null>(null);
  const [claimReason, setClaimReason] = useState<ClaimTicket['reason']>('colis_non_recu');
  const [claimSubject, setClaimSubject] = useState('');
  const [claimMessage, setClaimMessage] = useState('');

  // Active chat in claims tab
  const [activeClaimId, setActiveClaimId] = useState<string | null>(claims[0]?.id || null);
  const [replyMessage, setReplyMessage] = useState('');

  // Filter orders for current user email
  const userOrders = orders.filter(
    (o) => o.customer.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  const userClaims = claims.filter(
    (c) => c.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  // All digital purchases
  const digitalPurchases = userOrders.flatMap((order) =>
    order.items
      .filter((item) => item.format === 'numerique_pdf' || item.format === 'pack_duo')
      .map((item) => {
        const fullBook = books.find((b) => b.id === item.bookId);
        return {
          order,
          item,
          book: fullBook || ({
            id: item.bookId,
            title: item.title,
            subtitle: 'Édition numérique officielle',
            author: 'Émile Mourey',
            publisher: 'Éditions Émile Mourey',
            publicationYear: 2024,
            pages: 280,
            isbn: '978-2-9507295-X-X',
            dimensions: 'Format eBook PDF',
            weightGrams: 0,
            price: item.unitPrice,
            priceEbook: item.unitPrice,
            category: 'Histoire de Bibracte',
            shortDescription: 'Ouvrage historique au format numérique.',
            fullSynopsis: ['Version numérique intégrale transmise après achat sécurisé.'],
            tableOfContents: ['Chapitre 1 : Sources antiques', 'Chapitre 2 : Analyse topographique', 'Synthèse historique'],
            excerptTitle: 'Extrait certifié',
            excerptPages: ['« Lecture de l’exemplaire numérique acquis... »'],
            inStock: 99,
            coverBgColor: '#6B1D28',
            coverAccentColor: '#D4AF37',
            motif: 'shield',
            digitalPdfUrl: item.digitalPdfUrl || 'https://drive.google.com/drive/folders/17Y228r3cPkInk-smT1kF2tIHkxPUDwNU?usp=sharing'
          } as Book)
        };
      })
  );

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimModalOrderId || !claimSubject.trim() || !claimMessage.trim()) return;

    onOpenClaim(claimModalOrderId, claimReason, claimSubject, claimMessage);
    setClaimModalOrderId(null);
    setClaimSubject('');
    setClaimMessage('');
    setActiveTab('claims');
  };

  const handleSendReply = (claimId: string) => {
    if (!replyMessage.trim()) return;
    onSendClaimMessage(claimId, replyMessage);
    setReplyMessage('');
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'attente_cheque':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-amber-600" />
            En attente de chèque postal
          </span>
        );
      case 'attente_virement':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-amber-600" />
            En attente de virement bancaire
          </span>
        );
      case 'payee':
      case 'en_preparation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            <Package className="w-3 h-3 text-blue-600" />
            Payée · En préparation chez l'auteur
          </span>
        );
      case 'expediee':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
            <Truck className="w-3 h-3 text-indigo-600" />
            Expédiée via Colissimo
          </span>
        );
      case 'livree':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Commande Livrée / Accès validé
          </span>
        );
      default:
        return (
          <span className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Profile */}
      <div className="bg-[#F5F1E9] border border-stone-200 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-cinzel text-xs uppercase tracking-wider text-[#8B1E2D] font-bold">
            Espace Lecteur Sécurisé
          </span>
          <h2 className="font-serif-display text-2xl font-bold text-[#2B1810]">
            Bonjour, {currentUser.firstName} {currentUser.lastName}
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            {currentUser.email} · {currentUser.shippingAddress.city} ({currentUser.shippingAddress.postalCode})
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white rounded-md border border-stone-200 text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'orders' ? 'bg-[#8B1E2D] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Mes Commandes ({userOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('digital')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'digital' ? 'bg-[#8B1E2D] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mes eBooks PDF ({digitalPurchases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'claims' ? 'bg-[#8B1E2D] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Réclamations SAV ({userClaims.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-[#8B1E2D] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Mon Profil
          </button>
        </div>
      </div>

      {/* TAB 1: ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-lg p-8 text-center text-stone-500">
              <Package className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="font-serif-display text-base font-bold text-stone-700">
                Vous n'avez pas encore passé de commande.
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Découvrez les livres d'Émile Mourey sur Alésia, Bibracte et la Bourgogne dans le catalogue.
              </p>
              {onNavigateCatalog && (
                <button
                  onClick={onNavigateCatalog}
                  className="mt-4 px-4 py-2 bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-semibold rounded shadow-xs"
                >
                  Accéder au catalogue
                </button>
              )}
            </div>
          ) : (
            userOrders.map((order) => {
              const isDelivered = order.orderStatus === 'livree';
              const isPaid = order.paymentStatus === 'paye';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden"
                >
                  {/* Order header row */}
                  <div className="bg-[#FAF8F5] px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase block">Commande</span>
                        <span className="font-mono font-bold text-stone-900 text-sm">{order.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase block">Date</span>
                        <span className="font-medium text-stone-700">{order.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase block">Total</span>
                        <span className="font-serif-display font-bold text-[#8B1E2D] text-sm tabular-nums">
                          {(order.total ?? 0).toFixed(2)} €
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase block">Règlement</span>
                        <span className="text-stone-700 font-medium capitalize">
                          {order.paymentMethod === 'stripe_card'
                            ? 'Carte Bancaire (Stripe)'
                            : order.paymentMethod === 'paypal'
                            ? 'PayPal'
                            : order.paymentMethod === 'cheque_postal'
                            ? 'Chèque La Banque Postale'
                            : 'Virement bancaire'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.orderStatus)}

                      {/* Facture Download Trigger - only when LIVRÉ as per business rule */}
                      {isDelivered ? (
                        <button
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-medium transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Facture Officielle</span>
                        </button>
                      ) : (
                        <span
                          title="Conformément aux règles de facturation, la facture est disponible dès que la commande est livrée ou validée."
                          className="inline-flex items-center gap-1 text-[11px] text-stone-400 bg-stone-100 px-2.5 py-1 rounded cursor-help"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Facture (à la livraison)</span>
                        </span>
                      )}

                      {/* SAV Claim button */}
                      <button
                        onClick={() => {
                          setClaimModalOrderId(order.id);
                          setClaimSubject(`Problème sur la commande ${order.id}`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-amber-800 hover:bg-amber-50 rounded border border-amber-300 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Réclamation SAV</span>
                      </button>
                    </div>
                  </div>

                  {/* Order items and tracking */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Items (7 cols) */}
                    <div className="md:col-span-7 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Ouvrages commandés
                      </h5>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs border-b border-stone-100 pb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-stone-900">{item.title}</p>
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                                  {item.format === 'numerique_pdf'
                                    ? 'eBook PDF'
                                    : item.format === 'pack_duo'
                                    ? 'Pack Duo (Papier + PDF)'
                                    : 'Livre Papier'}
                                </span>
                              </div>

                              <p className="text-[11px] text-stone-500 mt-0.5">
                                Quantité : {item.quantity} · {item.format === 'numerique_pdf' ? 'Format numérique téléchargeable' : `Poids : ${item.weightGrams}g`}
                              </p>

                              {item.dedicationRequested && (
                                <p className="text-[11px] text-[#8B1E2D] italic flex items-center gap-1 mt-0.5">
                                  <Feather className="w-3 h-3" />
                                  Dédicace de l'auteur : {item.dedicationRecipient || 'Nom sur l’adresse'}
                                </p>
                              )}

                              {/* Paid eBook PDF download & reader buttons */}
                              {(item.format === 'numerique_pdf' || item.format === 'pack_duo') && (
                                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                  {isPaid ? (
                                    <>
                                      <a
                                        href={item.digitalPdfUrl || 'https://drive.google.com/drive/folders/17Y228r3cPkInk-smT1kF2tIHkxPUDwNU?usp=sharing'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8B1E2D] hover:bg-[#721824] text-white rounded text-[11px] font-semibold transition-colors shadow-2xs"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Télécharger le PDF</span>
                                        <ExternalLink className="w-3 h-3 opacity-80" />
                                      </a>

                                      <button
                                        onClick={() => {
                                          const b = books.find((x) => x.id === item.bookId);
                                          if (b) {
                                            setReadingDigitalBook({ book: b, order });
                                          }
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-stone-100 rounded text-[11px] font-semibold transition-colors shadow-2xs"
                                      >
                                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                                        <span>Lire en ligne</span>
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-flex items-center gap-1.5 font-medium">
                                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span>Accès PDF protégé : activé dès validation de votre paiement par l'auteur.</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="font-serif-display font-bold text-stone-800 tabular-nums">
                              {((item.unitPrice ?? 0) * (item.quantity ?? 1)).toFixed(2)} €
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-stone-600 pt-2 flex justify-between">
                        <span>Mode d'acheminement :</span>
                        <span className="font-medium text-stone-800">
                          {order.shippingMethod === 'colissimo_standard'
                            ? 'Colissimo La Poste Domicile'
                            : order.shippingMethod === 'colissimo_signature'
                            ? 'Colissimo Recommandé (Signature)'
                            : order.shippingMethod === 'point_relais'
                            ? `Point Relais (${order.selectedRelayPoint?.name || 'Commerçant'})`
                            : order.shippingMethod === 'telechargement_numerique'
                            ? 'Téléchargement numérique direct'
                            : 'Retrait en Saône-et-Loire'}
                        </span>
                      </div>
                    </div>

                    {/* Logistics Tracking (5 cols) */}
                    <div className="md:col-span-5 bg-stone-50 rounded-md p-4 border border-stone-200 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#8B1E2D]" />
                          Suivi Colissimo
                        </span>
                        {order.trackingNumber ? (
                          <span className="font-mono font-bold text-[#8B1E2D]">
                            {order.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">
                            {order.shippingMethod === 'telechargement_numerique' ? 'Non applicable (Numérique)' : 'En attente de prise en charge'}
                          </span>
                        )}
                      </div>

                      {order.trackingHistory && order.trackingHistory.length > 0 ? (
                        <div className="space-y-2 relative pl-4 border-l-2 border-stone-300">
                          {order.trackingHistory.map((stepItem, idx) => (
                            <div key={idx} className="relative text-[11px]">
                              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#8B1E2D]" />
                              <p className="font-medium text-stone-900">{stepItem.status}</p>
                              <p className="text-stone-500 text-[10px]">
                                {stepItem.date} · {stepItem.location}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-stone-500 text-[11px] py-2">
                          {order.orderStatus === 'attente_cheque' ? (
                            <p>
                              Dès réception de votre chèque à l’ordre d’Émile Mourey, votre commande sera validée et le numéro de suivi postal apparaîtra ici.
                            </p>
                          ) : order.shippingMethod === 'telechargement_numerique' ? (
                            <p className="text-emerald-800 font-medium">
                              Commande 100% numérique : vos fichiers PDF sont disponibles en téléchargement direct et dans votre onglet <em>« Mes eBooks PDF »</em>.
                            </p>
                          ) : (
                            <p>
                              Votre commande est en cours de préparation par l'auteur. Le colis sera expédié sous 24-48h.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: DIGITAL LIBRARY (DEDICATED EBOOKS & PDF SECTION) */}
      {activeTab === 'digital' && (
        <div className="bg-white rounded-lg border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B1E2D] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Bibliothèque Numérique Personnelle & Sécurisée</span>
            </div>
            <h3 className="font-serif-display font-bold text-2xl text-[#2B1810] mt-1">
              Vos Livres Numériques (eBooks & PDF)
            </h3>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Consultez et téléchargez les versions complètes en haute définition de vos ouvrages historiques d'Émile Mourey. Ces fichiers sont protégés par licence d'auteur et accessibles exclusivement après commande payée.
            </p>
          </div>

          {digitalPurchases.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-[#FAF8F5] rounded-lg border border-stone-200 p-6">
              <BookOpen className="w-12 h-12 mx-auto text-stone-300 stroke-[1.25]" />
              <h4 className="font-serif-display font-bold text-lg text-stone-800">
                Aucun livre numérique dans votre bibliothèque
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Vous n'avez pas encore commandé d'ouvrages au format numérique (PDF). Vous pouvez choisir le format <strong>eBook PDF (dès 9,90 €)</strong> ou le <strong>Pack Duo (Papier + PDF)</strong> sur chaque livre du catalogue.
              </p>
              {onNavigateCatalog && (
                <button
                  onClick={onNavigateCatalog}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-semibold rounded shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Découvrir le catalogue des livres d'histoire</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {digitalPurchases.map(({ order, item, book }, idx) => {
                const isPaid = order.paymentStatus === 'paye';

                return (
                  <div
                    key={`${order.id}-${item.bookId}-${idx}`}
                    className={`rounded-lg border p-5 flex flex-col justify-between space-y-4 transition-all ${
                      isPaid
                        ? 'border-stone-200 bg-[#FAF8F5] hover:border-stone-300 shadow-2xs'
                        : 'border-amber-200 bg-amber-50/50 opacity-85'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Book Cover thumbnail */}
                      <div className="shrink-0">
                        <BookCover book={book} size="sm" showBadge={false} />
                      </div>

                      {/* Info */}
                      <div className="space-y-1 min-w-0 flex-1 text-xs">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] text-stone-400">
                            Réf. {order.id}
                          </span>
                          {isPaid ? (
                            <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Accès Débloqué
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-800 bg-amber-100 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-600" />
                              Paiement en attente
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif-display font-bold text-base text-[#2B1810] line-clamp-2">
                          {book.title}
                        </h4>

                        <p className="font-serif-display italic text-stone-600 text-xs line-clamp-1">
                          {book.subtitle}
                        </p>

                        <div className="pt-1 text-[11px] text-stone-500 space-y-0.5">
                          <p>Auteur : <strong>{book.author}</strong></p>
                          <p>Pages : {book.pages} p. · Format : PDF officiel</p>
                          <p>Acheté le : {order.date}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions for Digital Purchase */}
                    <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                      {isPaid ? (
                        <>
                          <button
                            onClick={() => setReadingDigitalBook({ book, order })}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                            <span>Lire en ligne (Liseuse)</span>
                          </button>

                          <a
                            href={book.digitalPdfUrl || 'https://drive.google.com/drive/folders/17Y228r3cPkInk-smT1kF2tIHkxPUDwNU?usp=sharing'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#8B1E2D] hover:bg-[#721824] text-white rounded text-xs font-semibold shadow-xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Télécharger le PDF</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        </>
                      ) : (
                        <div className="w-full text-[11px] text-amber-900 bg-white p-2.5 rounded border border-amber-200 space-y-1">
                          <p className="font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            En attente de réception du règlement
                          </p>
                          <p className="text-[10px] text-stone-600">
                            Dès réception et validation de votre chèque ou virement par Monsieur Émile Mourey, les boutons de lecture et de téléchargement seront instantanément débloqués.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLAIMS (SAV) MESSAGING */}
      {activeTab === 'claims' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-lg border border-stone-200 p-6 shadow-xs">
          {/* Claim Tickets List (5 cols) */}
          <div className="md:col-span-5 border-r border-stone-200 pr-4 space-y-3">
            <h4 className="font-serif-display font-bold text-sm text-[#2B1810]">
              Vos Réclamations SAV ({userClaims.length})
            </h4>

            {userClaims.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-4">
                Aucune réclamation ouverte. En cas de colis endommagé ou de question de livraison, cliquez sur « Réclamation SAV » sur votre commande.
              </p>
            ) : (
              <div className="space-y-2">
                {userClaims.map((claim) => (
                  <button
                    key={claim.id}
                    onClick={() => setActiveClaimId(claim.id)}
                    className={`w-full text-left p-3 rounded-md border text-xs transition-colors ${
                      activeClaimId === claim.id
                        ? 'border-[#8B1E2D] bg-[#8B1E2D]/5'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-stone-800">{claim.id}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        claim.status === 'resolu' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {claim.status === 'resolu' ? 'Résolu' : 'En cours'}
                      </span>
                    </div>
                    <p className="font-semibold text-stone-900 mt-1 truncate">{claim.subject}</p>
                    <p className="text-[10px] text-stone-500">Réf : {claim.orderId} · {claim.createdAt}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Claim Thread (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between min-h-[360px]">
            {activeClaimId ? (
              (() => {
                const currentClaim = userClaims.find((c) => c.id === activeClaimId);
                if (!currentClaim) return <div>Sélectionnez une réclamation</div>;

                return (
                  <>
                    <div className="border-b border-stone-200 pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif-display font-bold text-base text-[#2B1810]">
                          {currentClaim.subject}
                        </h4>
                        <span className="text-xs text-stone-500 font-mono">
                          Commande {currentClaim.orderId}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Échanges directs avec l'auteur Émile Mourey
                      </p>
                    </div>

                    {/* Messages Thread */}
                    <div className="my-4 space-y-3 max-h-72 overflow-y-auto pr-2">
                      {currentClaim.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg text-xs space-y-1 ${
                            msg.sender === 'client'
                              ? 'bg-stone-100 ml-6 text-stone-800'
                              : 'bg-amber-50 border border-amber-200 mr-6 text-stone-900'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] text-stone-500">
                            <span className="font-bold text-stone-700">{msg.senderName}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reply Form */}
                    <div className="pt-3 border-t border-stone-200 flex gap-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Répondre à Monsieur Émile Mourey..."
                        className="flex-1 text-xs px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply(currentClaim.id)}
                      />
                      <button
                        onClick={() => handleSendReply(currentClaim.id)}
                        className="px-4 py-2 bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Envoyer</span>
                      </button>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="flex items-center justify-center h-full text-stone-400 text-xs">
                Sélectionnez une réclamation pour afficher les échanges.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg border border-stone-200 p-6 max-w-2xl space-y-4 text-xs shadow-xs">
          <h4 className="font-serif-display font-bold text-base text-[#2B1810] border-b border-stone-200 pb-2">
            Vos Informations Personnelles & Adresses de Livraison
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-stone-500 block">Nom complet :</span>
              <strong className="text-stone-900 text-sm">{currentUser.firstName} {currentUser.lastName}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Email :</span>
              <span className="text-stone-900 font-medium">{currentUser.email}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Téléphone de livraison :</span>
              <span className="text-stone-900">{currentUser.phone}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Adresse de livraison par défaut :</span>
              <span className="text-stone-900">
                {currentUser.shippingAddress.street}, {currentUser.shippingAddress.postalCode} {currentUser.shippingAddress.city}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Open Claim Modal */}
      {claimModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-stone-300 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h4 className="font-serif-display font-bold text-base text-[#2B1810]">
                Ouvrir une Réclamation SAV
              </h4>
              <button onClick={() => setClaimModalOrderId(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Commande concernée :
                </label>
                <input
                  type="text"
                  value={claimModalOrderId}
                  disabled
                  className="w-full px-3 py-1.5 bg-stone-100 border border-stone-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Motif :</label>
                <select
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded bg-white"
                >
                  <option value="colis_non_recu">Colis non reçu / retard de livraison La Poste</option>
                  <option value="colis_endommage">Colis endommagé ou livre abîmé</option>
                  <option value="erreur_commande">Erreur sur le contenu ou le livre reçu</option>
                  <option value="question_dedicace">Question sur la dédicace de l'auteur</option>
                  <option value="autre">Autre demande relative à la commande</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Objet du message :</label>
                <input
                  type="text"
                  value={claimSubject}
                  onChange={(e) => setClaimSubject(e.target.value)}
                  placeholder="Ex : Colis endommagé pendant le transport..."
                  required
                  className="w-full px-3 py-1.5 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description détaillée du problème :
                </label>
                <textarea
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  rows={4}
                  placeholder="Expliquez votre situation à Monsieur Émile Mourey..."
                  required
                  className="w-full px-3 py-1.5 border border-stone-300 rounded"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOrderId(null)}
                  className="px-4 py-2 border border-stone-300 rounded text-stone-700 hover:bg-stone-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8B1E2D] hover:bg-[#721824] text-white font-semibold rounded shadow-xs"
                >
                  Transmettre la réclamation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <InvoiceView
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}

      {/* In-app EBook Reader Modal for purchased digital books */}
      {readingDigitalBook && (
        <EBookReaderModal
          book={readingDigitalBook.book}
          order={readingDigitalBook.order}
          onClose={() => setReadingDigitalBook(null)}
        />
      )}
    </div>
  );
};

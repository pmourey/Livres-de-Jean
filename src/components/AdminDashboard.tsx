import React, { useState } from 'react';
import { Order, Book, ClaimTicket } from '../types';
import { AUTHOR_INFO } from '../data/initialData';
import { InvoiceView } from './InvoiceView';
import { ShippingLabelView } from './ShippingLabelView';
import { 
  ShieldCheck, Package, DollarSign, Truck, AlertTriangle, Check, 
  Printer, Plus, Edit, Trash2, ArrowUpRight, Search, FileText, Send 
} from 'lucide-react';

interface AdminDashboardProps {
  orders: Order[];
  books: Book[];
  claims: ClaimTicket[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['orderStatus'], trackingNumber?: string) => void;
  onValidateChequePayment: (orderId: string) => void;
  onUpdateBookStock: (bookId: string, newStock: number, newPrice?: number) => void;
  onAddBook: (newBook: Book) => void;
  onAnswerClaim: (claimId: string, replyText: string, markResolved?: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  books,
  claims,
  onUpdateOrderStatus,
  onValidateChequePayment,
  onUpdateBookStock,
  onAddBook,
  onAnswerClaim
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'books' | 'claims'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending_cheque' | 'to_ship' | 'delivered'>('all');
  
  // Selected modals
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);

  // Tracking number input state per order
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  // Claims replying state
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims[0]?.id || null);
  const [authorReplyText, setAuthorReplyText] = useState('');

  // Add Book Modal state
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookSubtitle, setNewBookSubtitle] = useState('');
  const [newBookPrice, setNewBookPrice] = useState('24.00');
  const [newBookPriceEbook, setNewBookPriceEbook] = useState('9.90');
  const [newBookDigitalPdfUrl, setNewBookDigitalPdfUrl] = useState('https://drive.google.com/drive/folders/17Y228r3cPkInk-smT1kF2tIHkxPUDwNU?usp=sharing');
  const [newBookWeight, setNewBookWeight] = useState('450');
  const [newBookStock, setNewBookStock] = useState('20');
  const [newBookIsbn, setNewBookIsbn] = useState('978-2-9538412-6-8');
  const [newBookCategory, setNewBookCategory] = useState<Book['category']>('Histoire de Bibracte');

  // Metrics
  const totalRevenue = orders.reduce((acc, o) => (o.paymentStatus === 'paye' ? acc + o.total : acc), 0);
  const pendingCheques = orders.filter((o) => o.orderStatus === 'attente_cheque');
  const toShipOrders = orders.filter((o) => o.orderStatus === 'payee' || o.orderStatus === 'en_preparation');
  const pendingClaims = claims.filter((c) => c.status !== 'resolu');

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'pending_cheque') return order.orderStatus === 'attente_cheque';
    if (orderFilter === 'to_ship') return order.orderStatus === 'payee' || order.orderStatus === 'en_preparation';
    if (orderFilter === 'delivered') return order.orderStatus === 'livree';
    return true;
  });

  const handleShipOrder = (orderId: string) => {
    const tracking = trackingInputs[orderId] || `8V01${Math.floor(100000000 + Math.random() * 900000000)}`;
    onUpdateOrderStatus(orderId, 'expediee', tracking);
  };

  const handleDeliverOrder = (orderId: string) => {
    onUpdateOrderStatus(orderId, 'livree');
  };

  const handleSendAuthorReply = (claimId: string, markResolved = false) => {
    if (!authorReplyText.trim()) return;
    onAnswerClaim(claimId, authorReplyText, markResolved);
    setAuthorReplyText('');
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const pricePapier = parseFloat(newBookPrice) || 24.0;
    const priceEbook = parseFloat(newBookPriceEbook) || 9.9;

    const newBook: Book = {
      id: `mourey-${Date.now()}`,
      title: newBookTitle,
      subtitle: newBookSubtitle || 'Étude historique et topographique',
      author: 'Émile Mourey',
      publisher: 'Éditions Émile Mourey',
      publicationYear: 2026,
      pages: 280,
      isbn: newBookIsbn,
      dimensions: '15 × 21 cm, broché',
      weightGrams: parseInt(newBookWeight, 10) || 450,
      price: pricePapier,
      priceEbook: priceEbook,
      priceCombo: pricePapier + 4.0,
      category: newBookCategory,
      shortDescription: 'Nouvelle parution historique d’Émile Mourey.',
      fullSynopsis: ['Ouvrage d’analyse topographique et historique approfondie.'],
      tableOfContents: ['Chapitre 1 : Sources et documents', 'Chapitre 2 : La vérité du terrain'],
      excerptTitle: 'Extrait introductif',
      excerptPages: ['« Texte inédit de l’auteur Émile Mourey... »'],
      inStock: parseInt(newBookStock, 10) || 20,
      coverBgColor: '#4A2818',
      coverAccentColor: '#D4AF37',
      motif: 'shield',
      digitalPdfUrl: newBookDigitalPdfUrl || 'https://drive.google.com/drive/folders/17Y228r3cPkInk-smT1kF2tIHkxPUDwNU?usp=sharing'
    };

    onAddBook(newBook);
    setShowAddBookModal(false);
    setNewBookTitle('');
    setNewBookSubtitle('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Administration */}
      <div className="bg-stone-900 text-stone-100 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-cinzel font-bold tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Espace Auteur & Gestion Commerciale</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold mt-1">
            Monsieur Émile Mourey
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Édition & Diffusion de livres d'histoire · SIREN {AUTHOR_INFO.siren} · {AUTHOR_INFO.bankAffiliation}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-800 rounded-md text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'orders' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            Commandes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'books' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            Catalogue & Stocks ({books.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'claims' ? 'bg-amber-600 text-white' : 'text-stone-300 hover:text-white'
            }`}
          >
            SAV & Réclamations ({pendingClaims.length})
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 uppercase tracking-wider block">Chiffre d'Affaires</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-serif-display font-bold text-stone-900 tabular-nums">
              {(totalRevenue ?? 0).toFixed(2)} €
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Paiements encaissés
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 uppercase tracking-wider block">Chèques à Valider</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-serif-display font-bold text-amber-800 tabular-nums">
              {pendingCheques.length}
            </span>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              La Banque Postale
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 uppercase tracking-wider block">Colis à Expédier</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-serif-display font-bold text-blue-900 tabular-nums">
              {toShipOrders.length}
            </span>
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Colissimo à préparer
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 uppercase tracking-wider block">Réclamations en cours</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-serif-display font-bold text-stone-900 tabular-nums">
              {pendingClaims.length}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${pendingClaims.length > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {pendingClaims.length > 0 ? 'À traiter' : 'Tout est à jour'}
            </span>
          </div>
        </div>
      </div>

      {/* TAB 1: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg border border-stone-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h3 className="font-serif-display font-bold text-lg text-[#2B1810]">
                Gestion et Expédition des Commandes
              </h3>
              <p className="text-xs text-stone-500">
                Validez les chèques reçus, imprimez les bordereaux Colissimo et renseignez les numéros de suivi.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 text-xs bg-stone-100 p-1 rounded">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-2.5 py-1 rounded font-medium ${orderFilter === 'all' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'}`}
              >
                Toutes ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('pending_cheque')}
                className={`px-2.5 py-1 rounded font-medium ${orderFilter === 'pending_cheque' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'}`}
              >
                Chèques ({pendingCheques.length})
              </button>
              <button
                onClick={() => setOrderFilter('to_ship')}
                className={`px-2.5 py-1 rounded font-medium ${orderFilter === 'to_ship' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'}`}
              >
                À préparer ({toShipOrders.length})
              </button>
              <button
                onClick={() => setOrderFilter('delivered')}
                className={`px-2.5 py-1 rounded font-medium ${orderFilter === 'delivered' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'}`}
              >
                Livrées
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] bg-stone-50">
                  <th className="py-2.5 px-3">Réf. & Date</th>
                  <th className="py-2.5 px-3">Client & Destinataire</th>
                  <th className="py-2.5 px-3">Articles & Dédicaces</th>
                  <th className="py-2.5 px-3">Règlement</th>
                  <th className="py-2.5 px-3">Statut & Actions</th>
                  <th className="py-2.5 px-3 text-right">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Ref */}
                    <td className="py-3 px-3 align-top font-mono font-bold text-stone-900">
                      {order.id}
                      <span className="block font-sans font-normal text-[11px] text-stone-500">
                        {order.date}
                      </span>
                      <span className="font-serif-display font-bold text-sm text-[#8B1E2D] block mt-1">
                        {(order.total ?? 0).toFixed(2)} €
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3 align-top">
                      <strong className="text-stone-900 block">
                        {order.customer.firstName} {order.customer.lastName}
                      </strong>
                      <span className="text-stone-600 block">{order.customer.street}</span>
                      <span className="text-stone-600 block">
                        {order.customer.postalCode} {order.customer.city}
                      </span>
                      <span className="text-stone-500 text-[10px] block font-mono">{order.customer.phone}</span>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-3 align-top max-w-xs">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="mb-1 text-stone-800">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium">• {i.quantity}× {i.title}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                              {i.format === 'numerique_pdf' ? 'eBook PDF' : i.format === 'pack_duo' ? 'Duo' : 'Papier'}
                            </span>
                          </div>
                          {i.dedicationRequested && (
                            <span className="block text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 mt-0.5">
                              ✍️ Dédicace : <strong>{i.dedicationRecipient || 'Nom client'}</strong>
                              {i.dedicationMessage && ` (${i.dedicationMessage})`}
                            </span>
                          )}
                        </div>
                      ))}
                      <span className="text-[10px] text-stone-400">Poids : {order.totalWeightGrams} g</span>
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-3 align-top">
                      <span className="font-medium text-stone-900 block">
                        {order.paymentMethod === 'stripe_card'
                          ? 'Carte Bancaire (Stripe)'
                          : order.paymentMethod === 'paypal'
                          ? 'PayPal'
                          : 'Chèque postal (La Banque Postale)'}
                      </span>
                      <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold mt-1 ${
                        order.paymentStatus === 'paye' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.paymentStatus === 'paye' ? 'Encaissé' : 'En attente de réception'}
                      </span>
                    </td>

                    {/* Status & Action workflows */}
                    <td className="py-3 px-3 align-top space-y-2 min-w-[200px]">
                      {order.orderStatus === 'attente_cheque' && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-amber-800 font-semibold block">
                            Chèque postal attendu
                          </span>
                          <button
                            onClick={() => onValidateChequePayment(order.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition-colors shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Valider la réception du chèque</span>
                          </button>
                        </div>
                      )}

                      {(order.orderStatus === 'payee' || order.orderStatus === 'en_preparation') && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-blue-800 font-semibold block">
                            Prêt à être emballé
                          </span>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="N° Colissimo..."
                              value={trackingInputs[order.id] || ''}
                              onChange={(e) =>
                                setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })
                              }
                              className="px-2 py-1 text-[11px] border border-stone-300 rounded font-mono w-28"
                            />
                            <button
                              onClick={() => handleShipOrder(order.id)}
                              className="px-2.5 py-1 bg-[#8B1E2D] hover:bg-[#721824] text-white rounded text-[11px] font-semibold transition-colors"
                            >
                              Expédier
                            </button>
                          </div>
                        </div>
                      )}

                      {order.orderStatus === 'expediee' && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-indigo-800 font-semibold block">
                            En transit Colissimo :
                          </span>
                          <span className="font-mono text-[10px] text-stone-700 block">
                            {order.trackingNumber}
                          </span>
                          <button
                            onClick={() => handleDeliverOrder(order.id)}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-900 text-white rounded text-[10px] font-medium"
                          >
                            Marquer comme Livré
                          </button>
                        </div>
                      )}

                      {order.orderStatus === 'livree' && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                          <Check className="w-3.5 h-3.5" /> Livré au destinataire
                        </span>
                      )}
                    </td>

                    {/* Document print triggers */}
                    <td className="py-3 px-3 align-top text-right space-y-1.5">
                      <button
                        onClick={() => setSelectedLabelOrder(order)}
                        title="Imprimer le bordereau Colissimo"
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-stone-300 hover:bg-stone-100 rounded text-[10px] text-stone-700 font-medium"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Bordereau Colissimo</span>
                      </button>

                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        title="Visualiser la facture officielle"
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-stone-300 hover:bg-stone-100 rounded text-[10px] text-stone-700 font-medium"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Facture #{order.id}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG & STOCKS */}
      {activeTab === 'books' && (
        <div className="bg-white rounded-lg border border-stone-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h3 className="font-serif-display font-bold text-lg text-[#2B1810]">
                Gestion du Catalogue et des Stocks
              </h3>
              <p className="text-xs text-stone-500">
                Ajustez les exemplaires disponibles, les tarifs et publiez de nouveaux ouvrages d'histoire.
              </p>
            </div>

            <button
              onClick={() => setShowAddBookModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-semibold rounded shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Publier un nouvel ouvrage</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((b) => (
              <div key={b.id} className="border border-stone-200 rounded-lg p-4 space-y-3 bg-[#FAF8F5]">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif-display font-bold text-sm text-[#2B1810] line-clamp-1">
                      {b.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-mono">ISBN : {b.isbn}</p>
                  </div>
                  <span className="font-serif-display font-bold text-base text-[#8B1E2D] tabular-nums">
                    {(b.price ?? 22.0).toFixed(2)} €
                  </span>
                </div>

                <div className="text-xs space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Poids :</span>
                    <span className="font-mono">{b.weightGrams} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pages :</span>
                    <span>{b.pages} p.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format :</span>
                    <span className="truncate max-w-[150px]">{b.dimensions}</span>
                  </div>
                </div>

                {/* Stock editor */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-xs text-stone-700 font-medium">Exemplaires en stock :</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateBookStock(b.id, Math.max(0, b.inStock - 1))}
                      className="w-6 h-6 border rounded bg-white text-stone-700 flex items-center justify-center font-bold text-xs hover:bg-stone-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-xs text-stone-900">
                      {b.inStock}
                    </span>
                    <button
                      onClick={() => onUpdateBookStock(b.id, b.inStock + 1)}
                      className="w-6 h-6 border rounded bg-white text-stone-700 flex items-center justify-center font-bold text-xs hover:bg-stone-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SAV CLAIMS MANAGEMENT */}
      {activeTab === 'claims' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-lg border border-stone-200 shadow-xs p-6">
          {/* Claim list */}
          <div className="md:col-span-5 border-r border-stone-200 pr-4 space-y-3">
            <h4 className="font-serif-display font-bold text-base text-[#2B1810]">
              Réclamations Clients ({claims.length})
            </h4>

            <div className="space-y-2">
              {claims.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`w-full text-left p-3 rounded-md border text-xs transition-colors ${
                    selectedClaimId === claim.id ? 'border-[#8B1E2D] bg-[#8B1E2D]/5' : 'border-stone-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-stone-900">{claim.id}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      claim.status === 'resolu' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {claim.status === 'resolu' ? 'Résolu' : 'En attente de réponse'}
                    </span>
                  </div>
                  <p className="font-semibold text-stone-900 mt-1 truncate">{claim.subject}</p>
                  <p className="text-[10px] text-stone-500">
                    Client : {claim.customerName} · Commande {claim.orderId}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Claim details & answer */}
          <div className="md:col-span-7 flex flex-col justify-between min-h-[380px]">
            {selectedClaimId ? {
              ...(() => {
                const currentClaim = claims.find((c) => c.id === selectedClaimId);
                if (!currentClaim) return <div>Sélectionnez une réclamation</div>;

                return (
                  <>
                    <div className="border-b border-stone-200 pb-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-serif-display font-bold text-base text-[#2B1810]">
                          {currentClaim.subject}
                        </h4>
                        <span className="text-xs font-mono text-stone-500">
                          Réf : {currentClaim.orderId}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Client : <strong>{currentClaim.customerName}</strong> ({currentClaim.customerEmail})
                      </p>
                    </div>

                    {/* Messages history */}
                    <div className="my-4 space-y-3 max-h-72 overflow-y-auto pr-2">
                      {currentClaim.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-lg text-xs space-y-1 ${
                            m.sender === 'auteur'
                              ? 'bg-stone-100 ml-6 text-stone-800'
                              : 'bg-amber-50 border border-amber-200 mr-6 text-stone-900'
                          }`}
                        >
                          <div className="flex justify-between text-[10px] text-stone-500">
                            <span className="font-bold">{m.senderName}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          <p className="leading-relaxed">{m.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reply box */}
                    <div className="pt-3 border-t border-stone-200 space-y-2">
                      <textarea
                        value={authorReplyText}
                        onChange={(e) => setAuthorReplyText(e.target.value)}
                        placeholder="Rédigez la réponse de Monsieur Émile Mourey..."
                        rows={3}
                        className="w-full text-xs p-2.5 border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSendAuthorReply(currentClaim.id, false)}
                          className="px-3.5 py-1.5 bg-stone-700 hover:bg-stone-800 text-white rounded text-xs font-medium"
                        >
                          Envoyer la réponse
                        </button>
                        <button
                          onClick={() => handleSendAuthorReply(currentClaim.id, true)}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold"
                        >
                          Répondre et Clôturer le litige
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()
            } : (
              <div className="text-stone-400 text-xs">Sélectionnez une réclamation</div>
            )}
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl border border-stone-300 p-6 space-y-4">
            <h4 className="font-serif-display font-bold text-lg text-[#2B1810] border-b border-stone-200 pb-2">
              Ajouter un Nouvel Ouvrage au Catalogue
            </h4>

            <form onSubmit={handleCreateBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Titre de l'ouvrage *</label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="Ex : Les Gaulois de Saône-et-Loire"
                  required
                  className="w-full px-3 py-1.5 border border-stone-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Sous-titre / Thématique</label>
                <input
                  type="text"
                  value={newBookSubtitle}
                  onChange={(e) => setNewBookSubtitle(e.target.value)}
                  placeholder="Ex : Découvertes et topographie nouvelle"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix Papier TTC (€) *</label>
                  <input
                    type="number"
                    step="0.50"
                    value={newBookPrice}
                    onChange={(e) => setNewBookPrice(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix eBook PDF (€) *</label>
                  <input
                    type="number"
                    step="0.50"
                    value={newBookPriceEbook}
                    onChange={(e) => setNewBookPriceEbook(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-stone-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Lien fichier PDF numérique sécurisé (Google Drive / Cloud)</label>
                <input
                  type="url"
                  value={newBookDigitalPdfUrl}
                  onChange={(e) => setNewBookDigitalPdfUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Papier initial *</label>
                  <input
                    type="number"
                    value={newBookStock}
                    onChange={(e) => setNewBookStock(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Poids postal (grammes)</label>
                  <input
                    type="number"
                    value={newBookWeight}
                    onChange={(e) => setNewBookWeight(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-stone-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catégorie *</label>
                  <select
                    value={newBookCategory}
                    onChange={(e) => setNewBookCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded bg-white"
                  >
                    <option value="Histoire de Bibracte">Histoire de Bibracte</option>
                    <option value="Gergovie & Gaule">Gergovie & Gaule</option>
                    <option value="Histoire du Christ">Histoire du Christ</option>
                    <option value="Coffrets & Intégrales">Coffrets & Intégrales</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={newBookIsbn}
                    onChange={(e) => setNewBookIsbn(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded text-stone-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8B1E2D] hover:bg-[#721824] text-white font-semibold rounded shadow-xs"
                >
                  Enregistrer l'ouvrage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal Preview */}
      {selectedInvoiceOrder && (
        <InvoiceView
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Shipping Label Modal */}
      {selectedLabelOrder && (
        <ShippingLabelView
          order={selectedLabelOrder}
          onClose={() => setSelectedLabelOrder(null)}
        />
      )}
    </div>
  );
};

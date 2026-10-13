import React, { useState } from 'react';
import { Order, Book, ClaimTicket } from '../types';
import { AUTHOR_INFO } from '../data/initialData';
import { InvoiceView } from './InvoiceView';
import { ShippingLabelView } from './ShippingLabelView';
import { PAYMENTS_API_BASE } from '../config/commerce';
import { 
  ShieldCheck, Package, DollarSign, Truck, AlertTriangle, Check, 
  Printer, Plus, Edit, Trash2, ArrowUpRight, Search, FileText, Send,
  Lock, LogOut, KeyRound, Eye, EyeOff, Sparkles, ArrowLeft, Mail
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
  onExitAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  books,
  claims,
  onUpdateOrderStatus,
  onValidateChequePayment,
  onUpdateBookStock,
  onAddBook,
  onAnswerClaim,
  onExitAdmin
}) => {
  // Admin Session State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem('emile_mourey_admin_token'));
  });
  const [adminSecretInput, setAdminSecretInput] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
  const [newBookDigitalPdfUrl, setNewBookDigitalPdfUrl] = useState('');
  const [newBookKindleAsin, setNewBookKindleAsin] = useState('');
  const [newBookR2Key, setNewBookR2Key] = useState('');
  const [newBookIsManuscript, setNewBookIsManuscript] = useState(false);
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
      isbn: newBookIsManuscript ? 'Sans ISBN (Hors commerce)' : newBookIsbn,
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
      kindleAsin: newBookKindleAsin.trim() || undefined,
      kindleUrl: newBookKindleAsin.trim() ? `https://www.amazon.fr/dp/${newBookKindleAsin.trim()}/` : undefined,
      r2Key: newBookR2Key.trim() || `livres/mourey-${Date.now()}.pdf`,
      canBuyPdf: !newBookIsManuscript,
      isManuscript: newBookIsManuscript,
      isUnpublished: newBookIsManuscript,
      digitalPdfUrl: newBookIsManuscript ? '' : (newBookR2Key.trim() || newBookDigitalPdfUrl || '')
    };

    onAddBook(newBook);
    setShowAddBookModal(false);
    setNewBookTitle('');
    setNewBookSubtitle('');
    setNewBookKindleAsin('');
    setNewBookR2Key('');
    setNewBookIsManuscript(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecretInput.trim()) return;

    setAuthError('');
    setIsAuthenticating(true);

    try {
      const response = await fetch(`${PAYMENTS_API_BASE}/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: adminSecretInput.trim() })
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        const token = data?.token || 'author-admin-session-token';
        sessionStorage.setItem('emile_mourey_admin_token', token);
        setIsAdminAuthenticated(true);
        setAdminSecretInput('');
        return;
      }

      // Check fallback passwords locally in case worker secret differs or worker is unreachable
      const allowedLocal = ['bibracte2026', 'gergovie-mourey', 'mourey1889'];
      if (allowedLocal.includes(adminSecretInput.trim())) {
        sessionStorage.setItem('emile_mourey_admin_token', 'author-admin-session-local');
        setIsAdminAuthenticated(true);
        setAdminSecretInput('');
        return;
      }

      const errData = await response.json().catch(() => null);
      setAuthError(errData?.error || 'Clé secrète auteur invalide.');
    } catch {
      // Local fallback for offline / demo environments
      const allowedLocal = ['bibracte2026', 'gergovie-mourey', 'mourey1889'];
      if (allowedLocal.includes(adminSecretInput.trim())) {
        sessionStorage.setItem('emile_mourey_admin_token', 'author-admin-session-local');
        setIsAdminAuthenticated(true);
        setAdminSecretInput('');
        return;
      }
      setAuthError('Clé secrète incorrecte ou serveur inaccessible.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLockAdmin = () => {
    sessionStorage.removeItem('emile_mourey_admin_token');
    setIsAdminAuthenticated(false);
    setAdminSecretInput('');
  };

  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const handleTestSmtpEmail = async () => {
    setIsTestingEmail(true);
    setTestEmailStatus(null);
    try {
      const res = await fetch(`${PAYMENTS_API_BASE}/api/admin/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'philippe.mourey@gmail.com' })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setTestEmailStatus('Email de test Gmail envoyé avec succès à philippe.mourey@gmail.com !');
      } else if (res.status === 404) {
        setTestEmailStatus("Le code du Worker a été mis à jour avec la route de test, mais votre Worker Cloudflare distant n'a pas encore été redéployé. Exécutez 'npx wrangler deploy' dans votre terminal pour activer l'envoi en ligne.");
      } else {
        setTestEmailStatus(`Info SMTP : ${data?.error || `Erreur serveur (${res.status})`}`);
      }
    } catch {
      setTestEmailStatus("Connexion au Worker impossible. Vérifiez que votre Worker est actif ou lancez 'npx wrangler deploy'.");
    } finally {
      setIsTestingEmail(false);
      setTimeout(() => setTestEmailStatus(null), 10000);
    }
  };

  // If not authenticated, render the dedicated secure Author Access Gate
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <span className="font-cinzel text-xs uppercase tracking-widest text-[#8B1E2D] font-bold block pt-2">
              Accès Protégé
            </span>
            <h2 className="font-serif-display text-2xl font-bold text-[#2B1810]">
              Gestion Auteur & Commandes
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Cet espace est strictement réservé à Monsieur Émile Mourey pour la gestion éditoriale, le suivi des commandes et l'affranchissement.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Clé d'accès secrète / Mot de passe auteur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={adminSecretInput}
                  onChange={(e) => {
                    setAdminSecretInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Saisissez la clé d'accès..."
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E2D] focus:bg-white transition-all font-mono"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating || !adminSecretInput.trim()}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-medium text-xs rounded shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isAuthenticating ? 'Vérification en cours...' : 'Déverrouiller le Back-Office'}</span>
            </button>
          </form>

          {/* Demonstration Quick Fill */}
          <div className="pt-4 border-t border-stone-200 text-center space-y-2">
            <p className="text-[11px] text-stone-500">
              Clé d'administration pour la démonstration :
            </p>
            <button
              type="button"
              onClick={() => {
                setAdminSecretInput('bibracte2026');
                setAuthError('');
              }}
              className="text-xs font-mono text-stone-700 hover:text-[#8B1E2D] underline underline-offset-2 transition-colors inline-flex items-center gap-1"
            >
              <span>bibracte2026</span>
              <Sparkles className="w-3 h-3 text-amber-600" />
            </button>
          </div>

          {onExitAdmin && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onExitAdmin}
                className="text-xs text-stone-600 hover:text-stone-900 inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour au catalogue public</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

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

        {/* Tab Controls + Lock Button */}
        <div className="flex flex-wrap items-center gap-2">
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

          <button
            onClick={handleTestSmtpEmail}
            disabled={isTestingEmail}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Tester l'envoi d'email SMTP vers philippe.mourey@gmail.com"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>{isTestingEmail ? 'Test en cours...' : 'Tester SMTP Gmail'}</span>
          </button>

          <button
            onClick={handleLockAdmin}
            className="px-3 py-2 bg-stone-800 hover:bg-rose-950 text-stone-300 hover:text-rose-200 border border-stone-700 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            title="Verrouiller l'espace auteur et fermer la session"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Verrouiller</span>
          </button>
        </div>
      </div>

      {/* SMTP Test Status Toast */}
      {testEmailStatus && (
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
          testEmailStatus.startsWith('Email de test')
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{testEmailStatus}</span>
          </div>
          <button onClick={() => setTestEmailStatus(null)} className="text-stone-400 hover:text-stone-700 text-xs">
            ✕
          </button>
        </div>
      )}

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
                    <p className="text-[11px] text-stone-500 font-mono">
                      {b.isUnpublished ? 'Sans ISBN (Pas de dépôt légal)' : `ISBN : ${b.isbn}`}
                    </p>
                  </div>
                  <span className={`font-serif-display font-bold text-sm tabular-nums ${b.isUnpublished ? 'text-amber-800' : 'text-[#8B1E2D]'}`}>
                    {b.isUnpublished ? 'Inédit' : `${Number(b.price || 22.0).toFixed(2)} €`}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Statut :</span>
                    <span className="font-medium text-stone-800">{b.isUnpublished ? 'Manuscrit d\'auteur' : 'Ouvrage publié'}</span>
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
                  <span className="text-xs text-stone-700 font-medium">
                    {b.isUnpublished ? 'Diffusion :' : 'Exemplaires en stock :'}
                  </span>
                  {b.isUnpublished ? (
                    <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      PDF prochainement
                    </span>
                  ) : (
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
                  )}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Clé Cloudflare R2 (Stockage PDF)</label>
                  <input
                    type="text"
                    value={newBookR2Key}
                    onChange={(e) => setNewBookR2Key(e.target.value)}
                    placeholder="livres/nom-du-livre.pdf"
                    className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">ASIN Amazon Kindle</label>
                  <input
                    type="text"
                    value={newBookKindleAsin}
                    onChange={(e) => setNewBookKindleAsin(e.target.value)}
                    placeholder="B0D1234567 ou ISBN-10"
                    className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-amber-50 rounded border border-amber-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isManuscriptToggle"
                  checked={newBookIsManuscript}
                  onChange={(e) => setNewBookIsManuscript(e.target.checked)}
                  className="rounded text-[#8B1E2D] focus:ring-[#8B1E2D]"
                />
                <label htmlFor="isManuscriptToggle" className="text-xs text-amber-950 font-medium cursor-pointer">
                  Manuscrit Inédit (Protection Droits d'Auteur : consultation d'extraits uniquement, pas de vente de PDF brut)
                </label>
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
                    <option value="Histoire de Mahomet">Histoire de Mahomet</option>
                    <option value="Manuscrits Inédits">Manuscrits Inédits</option>
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

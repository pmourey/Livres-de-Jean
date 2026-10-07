/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Book, CartItem, Order, ClaimTicket, UserAccount, BookFormat 
} from './types';
import { 
  INITIAL_BOOKS, INITIAL_ORDERS, INITIAL_CLAIMS, DEMO_CUSTOMER, AUTHOR_INFO 
} from './data/initialData';
import { Header } from './components/Header';
import { CatalogSection } from './components/CatalogSection';
import { BookDetailModal } from './components/BookDetailModal';
import { ExcerptReaderModal } from './components/ExcerptReaderModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthorSection } from './components/AuthorSection';
import { LegalModal } from './components/LegalModals';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation View: 'catalog' | 'author' | 'shipping' | 'account' | 'admin'
  const [currentView, setCurrentView] = useState<'catalog' | 'author' | 'shipping' | 'account' | 'admin'>('catalog');

  // Persistence State
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('emile_mourey_books');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge INITIAL_BOOKS with saved so that ALL initial books (including newly added Mahomet & Gaule) exist and have updated descriptions/quotes!
          const merged = INITIAL_BOOKS.map((ib) => {
            const pb = parsed.find((p: any) => p.id === ib.id);
            if (!pb) return ib;
            return {
              ...ib,
              ...pb,
              // Keep canonical enriched text, quotes, and unpublished flags from INITIAL_BOOKS
              shortDescription: ib.shortDescription,
              fullSynopsis: ib.fullSynopsis,
              tableOfContents: ib.tableOfContents,
              excerptTitle: ib.excerptTitle,
              excerptPages: ib.excerptPages,
              keyQuotes: ib.keyQuotes,
              availabilityNotice: ib.availabilityNotice,
              isUnpublished: ib.isUnpublished,
              category: ib.category,
              isbn: ib.isbn,
              isbn10: ib.isbn10,
              inStock: typeof pb.inStock === 'number' ? pb.inStock : ib.inStock
            };
          });

          // Also keep any user-created custom books from admin
          const customBooks = parsed.filter(
            (pb: any) => !INITIAL_BOOKS.some((ib) => ib.id === pb.id)
          );

          return [...merged, ...customBooks];
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_BOOKS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('emile_mourey_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            const initial = INITIAL_BOOKS.find((ib) => ib.id === item.book?.id);
            const book: Book = {
              ...(initial || {}),
              ...(item.book || {}),
              price: typeof item.book?.price === 'number' ? item.book.price : (initial?.price ?? 22.0),
              priceEbook: typeof item.book?.priceEbook === 'number' ? item.book.priceEbook : (initial?.priceEbook ?? 9.9)
            };
            const format = item.format || 'papier';
            const unitPrice =
              typeof item.unitPrice === 'number'
                ? item.unitPrice
                : format === 'numerique_pdf'
                ? book.priceEbook
                : book.price;
            return {
              ...item,
              book,
              format,
              unitPrice: typeof unitPrice === 'number' ? unitPrice : 22.0,
              quantity: typeof item.quantity === 'number' ? item.quantity : 1
            };
          });
        }
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('emile_mourey_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((o: any) => ({
            ...o,
            total: typeof o.total === 'number' ? o.total : 0,
            subtotal: typeof o.subtotal === 'number' ? o.subtotal : 0,
            shippingCost: typeof o.shippingCost === 'number' ? o.shippingCost : 0,
            items: (o.items || []).map((i: any) => ({
              ...i,
              unitPrice: typeof i.unitPrice === 'number' ? i.unitPrice : 0,
              quantity: typeof i.quantity === 'number' ? i.quantity : 1
            }))
          }));
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_ORDERS;
  });

  const [claims, setClaims] = useState<ClaimTicket[]>(() => {
    const saved = localStorage.getItem('emile_mourey_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('emile_mourey_user');
    return saved ? JSON.parse(saved) : DEMO_CUSTOMER;
  });

  // Modals
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [excerptBook, setExcerptBook] = useState<Book | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [legalModalType, setLegalModalType] = useState<'mentions' | 'cgv' | 'shipping_info' | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('emile_mourey_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('emile_mourey_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('emile_mourey_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('emile_mourey_claims', JSON.stringify(claims));
  }, [claims]);

  // Cart operations
  const handleAddToCart = (
    book: Book,
    quantity: number = 1,
    format: BookFormat = 'papier',
    unitPrice?: number,
    dedicationRequested: boolean = false,
    recipient?: string,
    message?: string
  ) => {
    // Unpublished manuscripts without legal deposit are not for sale
    if (book.isUnpublished) {
      return;
    }

    const finalUnitPrice =
      unitPrice !== undefined
        ? Number(unitPrice)
        : format === 'numerique_pdf'
        ? Number(book.priceEbook || 9.9)
        : format === 'pack_duo'
        ? Number(book.priceCombo || ((book.price || 22.0) + 4.0))
        : Number(book.price || 22.0);

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.book.id === book.id && item.format === format
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
          dedicationRequested: dedicationRequested || next[existingIdx].dedicationRequested,
          dedicationRecipient: recipient || next[existingIdx].dedicationRecipient,
          dedicationMessage: message || next[existingIdx].dedicationMessage
        };
        return next;
      }
      return [
        ...prev,
        {
          book,
          quantity,
          format,
          unitPrice: finalUnitPrice,
          dedicationRequested: format !== 'numerique_pdf' && dedicationRequested,
          dedicationRecipient: format !== 'numerique_pdf' ? recipient : undefined,
          dedicationMessage: format !== 'numerique_pdf' ? message : undefined
        }
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (bookId: string, format: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(bookId, format);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.book.id === bookId && item.format === format ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (bookId: string, format: string) => {
    setCart((prev) => prev.filter((item) => !(item.book.id === bookId && item.format === format)));
  };

  // Order created callback
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Clear cart
    setCart([]);
    // Show order confirmation modal
    setConfirmedOrder(newOrder);
  };

  // Admin actions: update status
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['orderStatus'], trackingNumber?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const updatedTrackingHistory = o.trackingHistory ? [...o.trackingHistory] : [];

        if (newStatus === 'expediee') {
          updatedTrackingHistory.push({
            date: now,
            status: `Colis pris en charge par La Poste Colissimo (N° ${trackingNumber || o.trackingNumber})`,
            location: 'Plateforme Colissimo Bourgogne'
          });
        } else if (newStatus === 'livree') {
          updatedTrackingHistory.push({
            date: now,
            status: 'Colis distribué et remis au destinataire',
            location: `${o.customer.city} (${o.customer.postalCode})`
          });
        }

        return {
          ...o,
          orderStatus: newStatus,
          trackingNumber: trackingNumber || o.trackingNumber,
          trackingHistory: updatedTrackingHistory,
          // Generate invoice number once delivered as per the business trigger rule!
          invoiceNumber: newStatus === 'livree' && !o.invoiceNumber ? `FAC-${o.id.replace('CMD-', '')}` : o.invoiceNumber
        };
      })
    );
  };

  // Admin actions: validate cheque payment
  const handleValidateChequePayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        return {
          ...o,
          paymentStatus: 'paye',
          orderStatus: 'en_preparation',
          chequeReceivedDate: now,
          trackingHistory: [
            ...(o.trackingHistory || []),
            {
              date: now,
              status: 'Chèque postal validé à La Banque Postale - Préparation du colis en cours',
              location: 'Éditions Émile Mourey'
            }
          ]
        };
      })
    );
  };

  // Admin actions: update books
  const handleUpdateBookStock = (bookId: string, newStock: number, newPrice?: number) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, inStock: newStock, price: newPrice !== undefined ? newPrice : b.price }
          : b
      )
    );
  };

  const handleAddBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
  };

  // SAV / Claims actions
  const handleOpenClaim = (
    orderId: string,
    reason: ClaimTicket['reason'],
    subject: string,
    message: string
  ) => {
    const newClaim: ClaimTicket = {
      id: `SAV-2026-0${Math.floor(100 + Math.random() * 900)}`,
      orderId,
      customerEmail: currentUser.email,
      customerName: `${currentUser.firstName} ${currentUser.lastName}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      subject,
      reason,
      status: 'ouvert',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'client',
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          text: message,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ]
    };

    setClaims((prev) => [newClaim, ...prev]);
  };

  const handleSendClaimMessage = (claimId: string, text: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        return {
          ...c,
          status: 'en_cours',
          messages: [
            ...c.messages,
            {
              id: `msg-${Date.now()}`,
              sender: 'client',
              senderName: `${currentUser.firstName} ${currentUser.lastName}`,
              text,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          ]
        };
      })
    );
  };

  const handleAnswerClaim = (claimId: string, replyText: string, markResolved = false) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        return {
          ...c,
          status: markResolved ? 'resolu' : 'en_cours',
          messages: [
            ...c.messages,
            {
              id: `msg-${Date.now()}`,
              sender: 'auteur',
              senderName: 'Émile Mourey (Auteur)',
              text: replyText,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          ]
        };
      })
    );
  };

  const cartTotalCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#22211F]">
      {/* Top Header */}
      <Header
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={setCurrentView}
        currentView={currentView}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {currentView === 'catalog' && (
          <CatalogSection
            books={books}
            onSelectBook={(book) => setSelectedBook(book)}
            onQuickAddToCart={(book, format) => handleAddToCart(book, 1, format)}
            onOpenExcerpt={(book) => setExcerptBook(book)}
          />
        )}

        {currentView === 'author' && <AuthorSection />}

        {currentView === 'shipping' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="text-center space-y-2 border-b border-stone-200 pb-6">
              <span className="font-cinzel text-xs uppercase tracking-widest text-[#8B1E2D] font-bold">
                Expédition & Transactions
              </span>
              <h2 className="font-serif-display text-3xl font-bold text-[#2B1810]">
                Guide de Livraison et Moyens de Paiement
              </h2>
              <p className="text-xs text-stone-600 max-w-xl mx-auto">
                Tout ce que vous devez savoir pour commander vos ouvrages d'histoire en toute sérénité.
              </p>
            </div>

            {/* Content cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-3">
                <h3 className="font-serif-display font-bold text-lg text-[#2B1810]">
                  🚚 Modes de Livraison La Poste
                </h3>
                <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                  <li>
                    <strong>Colissimo Domicile (sans signature) :</strong> Déposé en boîte aux lettres normalisée sous 48h ouvrées. Tarification transparente basée sur le poids du panier.
                  </li>
                  <li>
                    <strong>Colissimo Recommandé (avec signature) :</strong> Remis en mains propres avec assurance intégrale perte et avarie.
                  </li>
                  <li>
                    <strong>Point Relais Pickup / Mondial Relay :</strong> Retrait pratique chez votre commerçant le plus proche avec carte interactive de sélection.
                  </li>
                  <li className="text-emerald-700 font-semibold pt-1">
                    ✨ Franco de port : Les frais de port sont 100 % offerts dès 55,00 € d'achat !
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-3">
                <h3 className="font-serif-display font-bold text-lg text-[#2B1810]">
                  💳 Moyens de Paiement Sécurisés
                </h3>
                <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                  <li>
                    <strong>Carte Bancaire (Stripe 3D-Secure) :</strong> Paiement instantané et sécurisé par chiffrement bancaire 256 bits. Prise en compte immédiate.
                  </li>
                  <li>
                    <strong>Compte PayPal :</strong> Règlement direct en un clic sur le compte PayPal officiel de l'auteur Émile Mourey.
                  </li>
                  <li>
                    <strong>Chèque postal (La Banque Postale) :</strong> Établi à l'ordre d'Émile Mourey et expédié par voie postale avec bon de commande. La commande passe en <em>« En attente de paiement »</em> jusqu'à validation manuelle.
                  </li>
                  <li className="text-stone-500 pt-1">
                    Éditeur : Monsieur Émile Mourey · SIREN 418 122 883 · Domiciliation La Banque Postale.
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setCurrentView('catalog')}
                className="px-6 py-3 bg-[#8B1E2D] hover:bg-[#721824] text-white font-semibold text-xs rounded shadow transition-colors"
              >
                Parcourir le catalogue et commander
              </button>
            </div>
          </div>
        )}

        {currentView === 'account' && (
          <CustomerDashboard
            orders={orders}
            claims={claims}
            currentUser={currentUser}
            books={books}
            onOpenClaim={handleOpenClaim}
            onSendClaimMessage={handleSendClaimMessage}
            onViewBook={(bookId) => {
              const book = books.find((b) => b.id === bookId);
              if (book) setSelectedBook(book);
            }}
            onNavigateCatalog={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            orders={orders}
            books={books}
            claims={claims}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onValidateChequePayment={handleValidateChequePayment}
            onUpdateBookStock={handleUpdateBookStock}
            onAddBook={handleAddBook}
            onAnswerClaim={handleAnswerClaim}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenLegal={(type) => setLegalModalType(type)}
        onNavigateAdmin={() => setCurrentView('admin')}
        onNavigateAuthor={() => {
          setCurrentView('author');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onAddToCart={(book, qty, format, unitPrice, dedication, rec, msg) => {
            handleAddToCart(book, qty, format, unitPrice, dedication, rec, msg);
          }}
          onOpenExcerpt={(book) => setExcerptBook(book)}
        />
      )}

      {excerptBook && (
        <ExcerptReaderModal
          book={excerptBook}
          onClose={() => setExcerptBook(null)}
          onSelectForPurchase={(book) => setSelectedBook(book)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          currentUser={currentUser}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onGoToAccount={() => {
            setConfirmedOrder(null);
            setCurrentView('account');
          }}
          onGoToDigitalLibrary={() => {
            setConfirmedOrder(null);
            setCurrentView('account');
          }}
        />
      )}

      {legalModalType && (
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </div>
  );
}

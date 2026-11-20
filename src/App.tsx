/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { 
  Book, CartItem, Order, ClaimTicket, UserAccount, BookFormat 
} from './types';
import { 
  INITIAL_BOOKS, DEMO_CUSTOMER, AUTHOR_INFO 
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
import { MethodControversySection } from './components/MethodControversySection';
import { AiAssistantSection } from './components/AiAssistantSection';
import { LegalCharterPage } from './components/LegalCharterPage';
import { LegalModal } from './components/LegalModals';
import { Footer } from './components/Footer';
import { SeoHead } from './components/SeoHead';
import { PAYMENTS_API_BASE } from './config/commerce';

export default function App() {
  const isModerationPath = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.endsWith('/admin/moderation') || hash.includes('/admin/moderation');
  };

  const extractSharedAiSessionId = (): string | null => {
    const m =
      window.location.hash.match(/#\/ai\/share\/([a-zA-Z0-9_-]{4,32})/) ||
      window.location.pathname.match(/\/ai\/share\/([a-zA-Z0-9_-]{4,32})/);
    return m ? m[1] : null;
  };

  const [sharedAiSessionId, setSharedAiSessionId] = useState<string | null>(() =>
    extractSharedAiSessionId()
  );

  const extractViewFromQuery = (): 'catalog' | 'method' | 'ai' | 'author' | 'shipping' | 'legal' | 'account' | 'admin' | null => {
    const vue = new URLSearchParams(window.location.search).get('vue');
    if (vue === 'auteur') return 'author';
    if (vue === 'livraison') return 'shipping';
    if (vue === 'methode') return 'method';
    if (vue === 'assistant') return 'ai';
    if (vue === 'charte-legale') return 'legal';
    return null;
  };

  // Navigation View: 'catalog' | 'method' | 'ai' | 'author' | 'shipping' | 'legal' | 'account' | 'admin'
  const [currentView, setCurrentView] = useState<'catalog' | 'method' | 'ai' | 'author' | 'shipping' | 'legal' | 'account' | 'admin'>(() => {
    if (extractSharedAiSessionId()) return 'ai';
    if (isModerationPath()) return 'admin';
    return extractViewFromQuery() || 'catalog';
  });
  const [adminInitialTab, setAdminInitialTab] = useState<'orders' | 'books' | 'claims' | 'moderation'>(() =>
    isModerationPath() ? 'moderation' : 'orders'
  );

  useEffect(() => {
    const onRouteChange = () => {
      const shareId = extractSharedAiSessionId();
      if (shareId) {
        setSharedAiSessionId(shareId);
        setCurrentView('ai');
        return;
      }
      setSharedAiSessionId(null);
      if (isModerationPath()) {
        setAdminInitialTab('moderation');
        setCurrentView('admin');
        return;
      }
      const queryView = extractViewFromQuery();
      if (queryView) {
        setCurrentView(queryView);
      }
    };
    window.addEventListener('hashchange', onRouteChange);
    window.addEventListener('popstate', onRouteChange);
    return () => {
      window.removeEventListener('hashchange', onRouteChange);
      window.removeEventListener('popstate', onRouteChange);
    };
  }, []);

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
              kindleAsin: pb.kindleAsin || ib.kindleAsin,
              kindleUrl: pb.kindleUrl || ib.kindleUrl,
              r2Key: pb.r2Key || ib.r2Key,
              canBuyPdf: ib.canBuyPdf,
              isManuscript: ib.isManuscript,
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
          const loaded = parsed.map((o: any) => ({
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
          // Filter out legacy demo seed orders if saved previously in localStorage
          const legacySeedIds = new Set([
            'CMD-2026-0389', 'CMD-2026-0570', 'CMD-2026-0844', 'CMD-2026-0181',
            'CMD-2026-0970', 'CMD-2026-0210', 'CMD-2026-0182', 'CMD-2026-0195', 'CMD-2026-0201'
          ]);
          return loaded.filter((lo: any) => !legacySeedIds.has(lo.id));
        }
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const [claims, setClaims] = useState<ClaimTicket[]>(() => {
    const saved = localStorage.getItem('emile_mourey_claims');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c.id !== 'SAV-2026-0041');
        }
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('emile_mourey_user');
    return saved ? JSON.parse(saved) : DEMO_CUSTOMER;
  });

  // Modals (initialize selectedBook from canonical ?livre=<book.id> query parameter if present)
  const [selectedBook, setSelectedBook] = useState<Book | null>(() => {
    const bookId = new URLSearchParams(window.location.search).get('livre');
    if (!bookId) return null;
    return books.find((b) => b.id === bookId) || null;
  });
  const [excerptBook, setExcerptBook] = useState<Book | null>(null);

  // Sync canonical URL query parameters (?livre=<id> / ?vue=...) with active book & view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Preserve payment return parameters until the payment effect processes them
    if (params.has('payment')) return;

    const activeBook = selectedBook || excerptBook;
    if (activeBook) {
      params.set('livre', activeBook.id);
      params.delete('vue');
    } else {
      params.delete('livre');
      const viewSlugMap: Record<string, string> = {
        author: 'auteur',
        shipping: 'livraison',
        method: 'methode',
        ai: 'assistant',
        legal: 'charte-legale'
      };
      const slug = viewSlugMap[currentView];
      if (slug && !sharedAiSessionId) {
        params.set('vue', slug);
      } else {
        params.delete('vue');
      }
    }

    const search = params.toString();
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [selectedBook, excerptBook, currentView, sharedAiSessionId]);

  // Listen to browser history popstate for ?livre= deep links
  useEffect(() => {
    const onPopStateBook = () => {
      const bookId = new URLSearchParams(window.location.search).get('livre');
      if (bookId) {
        const matched = books.find((b) => b.id === bookId) || null;
        setSelectedBook(matched);
      } else {
        setSelectedBook(null);
      }
    };
    window.addEventListener('popstate', onPopStateBook);
    return () => window.removeEventListener('popstate', onPopStateBook);
  }, [books]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [legalModalType, setLegalModalType] = useState<'mentions' | 'cgv' | 'shipping_info' | null>(null);
  const [customerToken, setCustomerToken] = useState<string>(() => localStorage.getItem('emile_mourey_customer_token') || '');

  // Reading Theme State ('light' Parchment | 'dark' Dark Sepia)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('emile_mourey_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('emile_mourey_theme', theme);
  }, [theme]);

  // Author-controlled Maintenance Mode State (defaults to true as requested: under construction & payments paused)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('emile_mourey_maintenance_mode');
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        return true;
      }
    }
    return true;
  });

  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(() => {
    return (
      localStorage.getItem('emile_mourey_maintenance_message') ||
      "Les commandes et paiements d'ouvrages sont temporairement suspendus. La consultation du catalogue et la lecture des extraits restent disponibles."
    );
  });

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

  useEffect(() => {
    localStorage.setItem('emile_mourey_maintenance_mode', JSON.stringify(isMaintenanceMode));
  }, [isMaintenanceMode]);

  useEffect(() => {
    localStorage.setItem('emile_mourey_maintenance_message', maintenanceMessage);
  }, [maintenanceMessage]);

  useEffect(() => {
    if (customerToken) {
      localStorage.setItem('emile_mourey_customer_token', customerToken);
    } else {
      localStorage.removeItem('emile_mourey_customer_token');
    }
  }, [customerToken]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    if (paymentStatus !== 'paypal-success' && paymentStatus !== 'stripe-success') {
      return;
    }

    const pendingOrderJson = sessionStorage.getItem('pending_payment_order');
    if (!pendingOrderJson) {
      return;
    }

    try {
      const pendingOrder = JSON.parse(pendingOrderJson) as Order;
      const finalizedOrder: Order = {
        ...pendingOrder,
        paymentStatus: 'paye',
        orderStatus: pendingOrder.orderStatus === 'attente_cheque' || pendingOrder.orderStatus === 'attente_virement'
          ? pendingOrder.orderStatus
          : pendingOrder.orderStatus === 'livree'
          ? 'livree'
          : 'payee',
        notes: pendingOrder.notes || 'Paiement en ligne sécurisé validé.'
      };

      setOrders((prev) => {
        if (prev.some((order) => order.id === finalizedOrder.id)) {
          return prev;
        }
        return [finalizedOrder, ...prev];
      });
      setConfirmedOrder(finalizedOrder);
      setCart([]);

      // Synchronize finalized order immediately with Cloudflare D1
      fetch(`${PAYMENTS_API_BASE}/api/account/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: finalizedOrder.customer.email,
          firstName: finalizedOrder.customer.firstName,
          lastName: finalizedOrder.customer.lastName,
          phone: finalizedOrder.customer.phone,
          order: finalizedOrder
        })
      }).catch((err) => console.warn('Failed to sync payment return order to D1 worker:', err));
    } catch {
      // Ignore malformed pending orders and leave the success page untouched.
    } finally {
      sessionStorage.removeItem('pending_payment_order');
      sessionStorage.removeItem('pending_payment_provider');
      params.delete('payment');
      params.delete('token');
      params.delete('PayerID');
      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, []);

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
    // When maintenance mode is active, book ordering is disabled
    if (isMaintenanceMode) {
      setIsCartOpen(true);
      return;
    }

    // Unpublished manuscripts without legal deposit are not for sale
    if (book.isUnpublished) {
      return;
    }

    const finalUnitPrice =
      unitPrice !== undefined
        ? Number(unitPrice)
        : format === 'numerique_pdf'
        ? Number(book.priceEbook ?? 9.9)
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

  // Helper to synchronize any order to Cloudflare Worker D1 database
  const syncOrderToD1 = async (order: Order): Promise<boolean> => {
    try {
      const response = await fetch(`${PAYMENTS_API_BASE}/api/account/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: order.customer?.email || currentUser.email,
          firstName: order.customer?.firstName || currentUser.firstName,
          lastName: order.customer?.lastName || currentUser.lastName,
          phone: order.customer?.phone || currentUser.phone,
          order
        })
      });
      return response.ok;
    } catch (error) {
      console.warn('Failed to persist order to D1 backend:', error);
      return false;
    }
  };

  // Order created callback
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Clear cart
    setCart([]);
    // Show order confirmation modal
    setConfirmedOrder(newOrder);

    // Sync order to Cloudflare Worker D1 database
    void syncOrderToD1(newOrder);
  };

  // Initial sync of all orders from browser cache / initial state to Cloudflare D1
  useEffect(() => {
    if (orders.length > 0) {
      orders.forEach((o) => {
        void syncOrderToD1(o);
      });
    }
  }, []);

  const handleCustomerLogin = async (payload: { email: string; firstName: string; lastName: string; phone?: string; token?: string }) => {
    if (payload.token) {
      setCustomerToken(payload.token);
      setCurrentUser((prev) => ({
        ...prev,
        email: payload.email,
        firstName: payload.firstName || prev.firstName,
        lastName: payload.lastName || prev.lastName,
        phone: payload.phone || prev.phone
      }));
      return;
    }

    const response = await fetch(`${PAYMENTS_API_BASE}/api/account/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Login failed');
    }
    setCustomerToken(data.token);
    setCurrentUser((prev) => ({ ...prev, ...payload }));
  };

  const handleCustomerLogout = () => {
    setCustomerToken('');
    localStorage.removeItem('emile_mourey_customer_token');
  };

  // Helper to send shipping/delivery notification emails to customer
  const notifyShippingEmail = async (order: Order, status: 'expediee' | 'livree', trackingNumber?: string) => {
    try {
      await fetch(`${PAYMENTS_API_BASE}/api/account/orders/notify-shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, status, trackingNumber })
      });
    } catch (e) {
      console.warn('Failed to send shipping email notification:', e);
    }
  };

  // Helper to send claim/SAV email notifications to author and buyer
  const notifyClaimEmail = async (type: 'new_claim' | 'author_reply', claim: ClaimTicket, replyText?: string) => {
    try {
      await fetch(`${PAYMENTS_API_BASE}/api/account/claims/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, claim, replyText })
      });
    } catch (e) {
      console.warn('Failed to send claim email notification:', e);
    }
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

        const updated: Order = {
          ...o,
          orderStatus: newStatus,
          trackingNumber: trackingNumber || o.trackingNumber,
          trackingHistory: updatedTrackingHistory,
          // Generate invoice number once delivered as per the business trigger rule!
          invoiceNumber: newStatus === 'livree' && !o.invoiceNumber ? `FAC-${o.id.replace('CMD-', '')}` : o.invoiceNumber
        };
        void syncOrderToD1(updated);
        if (newStatus === 'expediee' || newStatus === 'livree') {
          void notifyShippingEmail(updated, newStatus, trackingNumber);
        }
        return updated;
      })
    );
  };

  // Admin actions: validate cheque payment
  const handleValidateChequePayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const isDigitalOnly = o.items.every((i) => i.format === 'numerique_pdf');
        const updated: Order = {
          ...o,
          paymentStatus: 'paye',
          orderStatus: isDigitalOnly ? 'livree' : 'en_preparation',
          chequeReceivedDate: now,
          invoiceNumber: isDigitalOnly && !o.invoiceNumber ? `FAC-${o.id.replace('CMD-', '')}` : o.invoiceNumber,
          notes: isDigitalOnly
            ? 'Commande 100% numérique payée en ligne. Téléchargements activés.'
            : o.notes,
          trackingHistory: [
            ...(o.trackingHistory || []),
            {
              date: now,
              status: isDigitalOnly
                ? 'Règlement validé - Accès numérique PDF immédiat débloqué'
                : 'Chèque postal validé à La Banque Postale - Préparation du colis en cours',
              location: 'Éditions Émile Mourey'
            }
          ]
        };
        void syncOrderToD1(updated);
        return updated;
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
    void notifyClaimEmail('new_claim', newClaim);
  };

  const handleSendClaimMessage = (claimId: string, text: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const updatedClaim: ClaimTicket = {
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
        void notifyClaimEmail('new_claim', updatedClaim);
        return updatedClaim;
      })
    );
  };

  const handleAnswerClaim = (claimId: string, replyText: string, markResolved = false) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const updatedClaim: ClaimTicket = {
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
        void notifyClaimEmail('author_reply', updatedClaim, replyText);
        return updatedClaim;
      })
    );
  };

  const cartTotalCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const handleNavigate = (view: 'catalog' | 'method' | 'ai' | 'author' | 'shipping' | 'legal' | 'account' | 'admin') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#22211F]">
      {/* Dynamic SEO Head: canonical links, OpenGraph/Twitter meta tags, and Schema.org Book & Product JSON-LD */}
      <SeoHead
        books={books}
        selectedBook={selectedBook}
        excerptBook={excerptBook}
        currentView={currentView}
        isMaintenanceMode={isMaintenanceMode}
      />

      {/* Top Header with prominent non-dismissible maintenance banner */}
      <Header
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={handleNavigate}
        currentView={currentView}
        isMaintenanceMode={isMaintenanceMode}
        maintenanceMessage={maintenanceMessage}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main View Switcher with smooth fade-in transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentView === 'catalog' && (
          <CatalogSection
            books={books}
            onSelectBook={(book) => setSelectedBook(book)}
            onQuickAddToCart={(book, format) => handleAddToCart(book, 1, format)}
            onOpenExcerpt={(book) => setExcerptBook(book)}
            isMaintenanceMode={isMaintenanceMode}
          />
        )}

        {currentView === 'method' && (
          <MethodControversySection
            books={books}
            onSelectBook={(book) => setSelectedBook(book)}
            onNavigateCatalog={() => {
              setCurrentView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateLegal={() => {
              setCurrentView('legal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateAccount={() => {
              setCurrentView('account');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            customerToken={customerToken}
            defaultAuthorName={`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()}
          />
        )}

        {currentView === 'ai' && (
          <AiAssistantSection
            books={books}
            customerToken={customerToken}
            customerEmail={currentUser?.email}
            sharedSessionId={sharedAiSessionId}
            onExitSharedSession={() => {
              setSharedAiSessionId(null);
              if (window.location.hash.includes('/ai/share/')) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              }
            }}
            onSelectBook={(book) => setSelectedBook(book)}
            onNavigateAccount={() => {
              setCurrentView('account');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateMethod={() => {
              setCurrentView('method');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'author' && <AuthorSection />}

        {currentView === 'legal' && (
          <LegalCharterPage
            onNavigateCatalog={() => {
              setCurrentView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateMethod={() => {
              setCurrentView('method');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCgv={() => setLegalModalType('cgv')}
          />
        )}

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
            customerToken={customerToken}
            onLogin={handleCustomerLogin}
            onLogout={handleCustomerLogout}
            onOpenClaim={handleOpenClaim}
            onSendClaimMessage={handleSendClaimMessage}
            onViewBook={(bookId) => {
              const book = books.find((b) => b.id === bookId);
              if (book) setSelectedBook(book);
            }}
            onNavigateCatalog={() => setCurrentView('catalog')}
            onValidateChequePayment={handleValidateChequePayment}
            onSyncOrders={async () => {
              for (const o of orders) {
                await syncOrderToD1(o);
              }
            }}
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
            onExitAdmin={() => setCurrentView('catalog')}
            isMaintenanceMode={isMaintenanceMode}
            onToggleMaintenanceMode={(val) => setIsMaintenanceMode(val)}
            maintenanceMessage={maintenanceMessage}
            onUpdateMaintenanceMessage={(msg) => setMaintenanceMessage(msg)}
            initialTab={adminInitialTab}
          />
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        onOpenLegal={(type) => setLegalModalType(type)}
        onNavigateAdmin={() => setCurrentView('admin')}
        onNavigateAuthor={() => {
          setCurrentView('author');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateCatalog={() => {
          setCurrentView('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateMethod={() => {
          setCurrentView('method');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateAi={() => {
          setCurrentView('ai');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateLegalPage={() => {
          setCurrentView('legal');
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
          isMaintenanceMode={isMaintenanceMode}
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
        isMaintenanceMode={isMaintenanceMode}
      />

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          currentUser={currentUser}
          onOrderCreated={handleOrderCreated}
          isMaintenanceMode={isMaintenanceMode}
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
    </MotionConfig>
  );
}

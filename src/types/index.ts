export type BookCategory = 
  | 'Histoire de Bibracte'
  | 'Gergovie & Gaule'
  | 'Histoire du Christ'
  | 'Coffrets & Intégrales';

export type BookFormat = 'papier' | 'numerique_pdf' | 'pack_duo';

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  tome?: string;
  publicationYear: number;
  pages: number;
  isbn: string;
  isbn10?: string;
  dimensions: string; // e.g. "15 × 21 cm, broché"
  weightGrams: number;
  price: number; // Prix papier
  priceEbook: number; // Prix PDF numérique
  priceCombo?: number; // Prix papier + PDF
  originalPrice?: number;
  category: BookCategory;
  shortDescription: string;
  fullSynopsis: string[];
  tableOfContents: string[];
  excerptTitle: string;
  excerptPages: string[];
  inStock: number;
  featured?: boolean;
  coverBgColor: string;
  coverAccentColor: string;
  motif: 'shield' | 'fortress' | 'laurel' | 'map' | 'scroll' | 'cross';
  amazonUrl?: string;
  digitalPdfUrl: string; // Accessible uniquement après commande payée
}

export interface CartItem {
  book: Book;
  quantity: number;
  format: BookFormat;
  unitPrice: number;
  dedicationRequested: boolean;
  dedicationRecipient?: string;
  dedicationMessage?: string;
}

export type ShippingMethodId = 'colissimo_standard' | 'colissimo_signature' | 'point_relais' | 'retrait_auteur' | 'telechargement_numerique';

export interface ShippingMethod {
  id: ShippingMethodId;
  name: string;
  carrier: string;
  estimatedDelivery: string;
  basePrice: number;
  description: string;
  isRelay?: boolean;
}

export interface RelayPoint {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  distanceKm: number;
  carrier: string;
  hours: string;
}

export type PaymentMethodType = 'stripe_card' | 'paypal' | 'cheque_postal' | 'virement_bancaire';

export type OrderStatus = 'attente_cheque' | 'attente_virement' | 'payee' | 'en_preparation' | 'expediee' | 'livree' | 'annulee';

export interface OrderItem {
  bookId: string;
  title: string;
  format: BookFormat;
  unitPrice: number;
  quantity: number;
  weightGrams: number;
  dedicationRequested: boolean;
  dedicationRecipient?: string;
  dedicationMessage?: string;
  digitalPdfUrl?: string;
}

export interface CustomerAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Order {
  id: string; // e.g. "CMD-2026-0842"
  date: string;
  customer: CustomerAddress;
  items: OrderItem[];
  subtotal: number;
  shippingMethod: ShippingMethodId;
  shippingCost: number;
  total: number;
  totalWeightGrams: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'paye' | 'en_attente' | 'rembourse';
  orderStatus: OrderStatus;
  selectedRelayPoint?: RelayPoint;
  trackingNumber?: string; // e.g. "8V01928374829"
  trackingHistory?: {
    date: string;
    status: string;
    location: string;
  }[];
  invoiceNumber?: string; // e.g. "FAC-2026-0842"
  chequeReceivedDate?: string;
  notes?: string;
}

export interface ClaimTicket {
  id: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  createdAt: string;
  subject: string;
  reason: 'colis_non_recu' | 'colis_endommage' | 'erreur_commande' | 'question_dedicace' | 'autre';
  status: 'ouvert' | 'en_cours' | 'resolu' | 'ferme';
  messages: {
    id: string;
    sender: 'client' | 'auteur';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingAddress: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

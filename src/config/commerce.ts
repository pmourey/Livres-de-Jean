export const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '';
export const PAYPAL_PAYMENT_LINK = import.meta.env.VITE_PAYPAL_PAYMENT_LINK || '';
export const PAYMENTS_API_BASE = import.meta.env.VITE_PAYMENTS_API_BASE;

export const amazonKindleSearchUrl = (title: string, author: string) =>
  `https://www.amazon.fr/s?k=${encodeURIComponent(`${title} ${author} Kindle`)}`;

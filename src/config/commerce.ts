export const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '';
export const PAYPAL_PAYMENT_LINK = import.meta.env.VITE_PAYPAL_PAYMENT_LINK || '';
const paymentsApiBaseRaw = import.meta.env.VITE_PAYMENTS_API_BASE;
export const PAYMENTS_API_BASE = (
  paymentsApiBaseRaw && paymentsApiBaseRaw !== 'undefined'
    ? paymentsApiBaseRaw
    : 'https://livres-de-jean-payments.super-violet-dc40.workers.dev'
).replace(/\/+$/, '');

export const amazonKindleSearchUrl = (title: string, author: string) =>
  `https://www.amazon.fr/s?k=${encodeURIComponent(`${title} ${author} Kindle`)}`;

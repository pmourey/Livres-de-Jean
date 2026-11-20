import React, { useEffect } from 'react';
import { Book } from '../types';
import {
  PublicView,
  getBaseCanonicalUrl,
  getBookCanonicalUrl,
  getViewCanonicalUrl,
  parseValidIsbn13,
  buildCatalogGraphJsonLd,
  buildActiveBookGraphJsonLd
} from '../utils/seo';

interface SeoHeadProps {
  books: Book[];
  selectedBook: Book | null;
  excerptBook: Book | null;
  currentView: PublicView;
  isMaintenanceMode: boolean;
}

const DEFAULT_TITLE = 'Éditions Émile Mourey - Librairie Historique';
const DEFAULT_DESCRIPTION =
  "Boutique officielle des livres d'histoire de l'auteur Émile Mourey. Découvrez ses recherches sur Bibracte, Gergovie, les Éduens et l'Antiquité en édition papier ou numérique.";

function upsertMetaTag(
  attr: 'name' | 'property',
  key: string,
  content: string
): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMetaTag(attr: 'name' | 'property', key: string): void {
  const el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (el) {
    el.remove();
  }
}

function upsertCanonicalLink(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLdScript(id: string, data: unknown): void {
  let script = document.head.querySelector<HTMLScriptElement>(
    `script[type="application/ld+json"]#${id}`
  );
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

function removeJsonLdScript(id: string): void {
  const script = document.head.querySelector(`script[type="application/ld+json"]#${id}`);
  if (script) {
    script.remove();
  }
}

function truncateDescription(text: string, maxLength: number = 158): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  books,
  selectedBook,
  excerptBook,
  currentView,
  isMaintenanceMode
}) => {
  const activeBook = selectedBook || excerptBook;

  // 1. Always keep the full catalog JSON-LD (WebSite, BookStore, Author, ItemList of Book/Product) up to date in <head>
  useEffect(() => {
    const baseUrl = getBaseCanonicalUrl();
    const catalogJsonLd = buildCatalogGraphJsonLd(books, baseUrl, isMaintenanceMode);
    upsertJsonLdScript('seo-jsonld-catalog', catalogJsonLd);
  }, [books, isMaintenanceMode]);

  // 2. Dynamically update <link rel="canonical">, <title>, meta/OG/Twitter tags, and active book JSON-LD
  useEffect(() => {
    const baseUrl = getBaseCanonicalUrl();

    if (activeBook) {
      const canonicalUrl = getBookCanonicalUrl(activeBook.id, baseUrl);
      const bookTitle = activeBook.tome
        ? `${activeBook.title} (${activeBook.tome}) – Émile Mourey`
        : `${activeBook.title} – Éditions Émile Mourey`;
      const bookDescription = truncateDescription(
        `${activeBook.subtitle ? `${activeBook.subtitle}. ` : ''}${activeBook.shortDescription}`
      );
      const validIsbn = parseValidIsbn13(activeBook.isbn);

      document.title = bookTitle;
      upsertCanonicalLink(canonicalUrl);

      upsertMetaTag('name', 'description', bookDescription);
      upsertMetaTag('name', 'robots', 'index, follow');

      upsertMetaTag('property', 'og:type', 'book');
      upsertMetaTag('property', 'og:site_name', 'Éditions Émile Mourey');
      upsertMetaTag('property', 'og:locale', 'fr_FR');
      upsertMetaTag('property', 'og:url', canonicalUrl);
      upsertMetaTag('property', 'og:title', bookTitle);
      upsertMetaTag('property', 'og:description', bookDescription);

      upsertMetaTag('property', 'book:author', activeBook.author);
      upsertMetaTag('property', 'book:release_date', String(activeBook.publicationYear));
      if (validIsbn) {
        upsertMetaTag('property', 'book:isbn', validIsbn.formatted);
      } else {
        removeMetaTag('property', 'book:isbn');
      }

      upsertMetaTag('name', 'twitter:card', 'summary_large_image');
      upsertMetaTag('name', 'twitter:title', bookTitle);
      upsertMetaTag('name', 'twitter:description', bookDescription);

      const activeBookJsonLd = buildActiveBookGraphJsonLd(
        activeBook,
        baseUrl,
        isMaintenanceMode
      );
      upsertJsonLdScript('seo-jsonld-active-book', activeBookJsonLd);
      return;
    }

    // No active book modal: configure metadata & canonical for the active view
    removeJsonLdScript('seo-jsonld-active-book');
    removeMetaTag('property', 'book:isbn');
    removeMetaTag('property', 'book:author');
    removeMetaTag('property', 'book:release_date');

    let title = DEFAULT_TITLE;
    let description = DEFAULT_DESCRIPTION;
    let robots = 'index, follow';

    if (currentView === 'author') {
      title = "Émile Mourey – Biographie de l'Auteur & Travaux Historiques";
      description =
        "Découvrez le parcours d'Émile Mourey, historien, ancien officier de Saint-Cyr et chercheur indépendant sur Bibracte, Gergovie et la Gaule antique.";
    } else if (currentView === 'method') {
      title = 'Méthode Topographique & Controverses – Éditions Émile Mourey';
      description =
        "Analyse critique des sources antiques, topographie militaire de Bibracte et Gergovie et débats historiques autour des travaux d'Émile Mourey.";
    } else if (currentView === 'ai') {
      title = "Exploration des Ouvrages d'Émile Mourey – Éditions Émile Mourey";
      description =
        "Explorez les thèses historiques, citations et extraits des livres d'Émile Mourey sur la Gaule, Bibracte et Gergovie.";
    } else if (currentView === 'legal') {
      title = 'Charte Légale & Mentions – Éditions Émile Mourey';
      description =
        "Mentions légales, droits d'auteur et conditions générales de vente des Éditions Émile Mourey.";
    } else if (currentView === 'shipping') {
      title = 'Livraison & Paiement Sécurisé – Éditions Émile Mourey';
      description =
        'Modes de livraison Colissimo et Point Relais, franco de port dès 55 €, et moyens de paiement sécurisés des Éditions Émile Mourey.';
    } else if (currentView === 'account') {
      title = 'Espace Client – Éditions Émile Mourey';
      description = 'Consultez vos commandes, factures et téléchargements numériques PDF.';
      robots = 'noindex, nofollow';
    } else if (currentView === 'admin') {
      title = 'Gestion Auteur – Éditions Émile Mourey';
      description = 'Espace protégé réservé à la gestion éditoriale et commerciale.';
      robots = 'noindex, nofollow';
    }

    const canonicalUrl = getViewCanonicalUrl(currentView, baseUrl);
    document.title = title;
    upsertCanonicalLink(canonicalUrl);

    upsertMetaTag('name', 'description', description);
    upsertMetaTag('name', 'robots', robots);

    upsertMetaTag('property', 'og:type', 'website');
    upsertMetaTag('property', 'og:site_name', 'Éditions Émile Mourey');
    upsertMetaTag('property', 'og:locale', 'fr_FR');
    upsertMetaTag('property', 'og:url', canonicalUrl);
    upsertMetaTag('property', 'og:title', title);
    upsertMetaTag('property', 'og:description', description);

    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', title);
    upsertMetaTag('name', 'twitter:description', description);
  }, [activeBook, currentView, isMaintenanceMode]);

  return null;
};

import { Book } from '../types';
import { AUTHOR_INFO } from '../data/initialData';

export type PublicView =
  | 'catalog'
  | 'method'
  | 'ai'
  | 'author'
  | 'shipping'
  | 'legal'
  | 'account'
  | 'admin';

const DEFAULT_FALLBACK_ORIGIN = 'https://pmourey.github.io/Livres-de-Jean/';

/**
 * Resolves the canonical base URL dynamically from the current window location
 * (client-side SPA pattern: origin + pathname).
 */
export function getBaseCanonicalUrl(): string {
  if (typeof window === 'undefined' || !window.location) {
    return DEFAULT_FALLBACK_ORIGIN;
  }
  const { origin, pathname } = window.location;
  if (!origin || origin === 'null') {
    return DEFAULT_FALLBACK_ORIGIN;
  }
  const normalizedPath = pathname || '/';
  return `${origin}${normalizedPath}`;
}

/**
 * Generates the canonical URL for a specific book in the catalog.
 */
export function getBookCanonicalUrl(bookId: string, baseUrl: string = getBaseCanonicalUrl()): string {
  const url = new URL(baseUrl);
  url.search = '';
  url.hash = '';
  url.searchParams.set('livre', bookId);
  return url.toString();
}

/**
 * Generates the canonical URL for a top-level view of the site.
 */
export function getViewCanonicalUrl(view: PublicView, baseUrl: string = getBaseCanonicalUrl()): string {
  const url = new URL(baseUrl);
  url.search = '';
  url.hash = '';
  if (view === 'author') {
    url.searchParams.set('vue', 'auteur');
  } else if (view === 'shipping') {
    url.searchParams.set('vue', 'livraison');
  } else if (view === 'method') {
    url.searchParams.set('vue', 'methode');
  } else if (view === 'ai') {
    url.searchParams.set('vue', 'assistant');
  } else if (view === 'legal') {
    url.searchParams.set('vue', 'charte-legale');
  }
  return url.toString();
}

/**
 * Validates and normalizes an ISBN-13 string.
 * Returns null for unpublished manuscripts ("Sans ISBN (Hors commerce)").
 */
export function parseValidIsbn13(isbn?: string): { formatted: string; gtin13: string } | null {
  if (!isbn) return null;
  const digits = isbn.replace(/[^0-9]/g, '');
  if (/^97[89]\d{10}$/.test(digits)) {
    return {
      formatted: isbn.trim(),
      gtin13: digits
    };
  }
  return null;
}

/**
 * Builds the Schema.org Person entity for the author Émile Mourey.
 */
export function buildAuthorEntity(baseUrl: string) {
  return {
    '@type': 'Person',
    '@id': `${baseUrl}#author`,
    name: 'Émile Mourey',
    jobTitle: AUTHOR_INFO.role,
    description:
      "Historien indépendant et ancien officier de Saint-Cyr, auteur d'une collection de 12 ouvrages sur la Guerre des Gaules (Bibracte, Alésia, Gergovie), l'art roman bourguignon et les textes sacrés, ainsi que de 559 articles publiés sur AgoraVox.",
    award: AUTHOR_INFO.decorations,
    url: getViewCanonicalUrl('author', baseUrl),
    sameAs: [
      'https://www.agoravox.fr/auteur/emile-mourey',
      'https://github.com/pmourey/Livres-de-Jean'
    ],
    knowsAbout: [
      'Bibracte',
      'Mont-Saint-Vincent',
      'Mont Beuvray',
      'Gorgobina',
      'Alésia',
      'Gergovie',
      'Guerre des Gaules',
      'De Bello Gallico',
      'Table de Peutinger',
      'Art roman bourguignon',
      'Manuscrits de Qumrân'
    ]
  };
}

/**
 * Builds the Schema.org Organization / BookStore entity for Éditions Émile Mourey.
 */
export function buildPublisherEntity(baseUrl: string) {
  return {
    '@type': ['Organization', 'BookStore'],
    '@id': `${baseUrl}#publisher`,
    name: 'Éditions Émile Mourey',
    url: baseUrl,
    email: AUTHOR_INFO.contactEmail,
    telephone: AUTHOR_INFO.phone,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'SIREN',
      value: AUTHOR_INFO.siren
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Le Creusot',
      postalCode: '71200',
      addressRegion: 'Bourgogne-Franche-Comté',
      addressCountry: 'FR'
    }
  };
}

/**
 * Builds combined Schema.org 'Book' and 'Product' JSON-LD structured data for a book.
 * Commercial titles use multi-type ["Book", "Product"] with full Offer details;
 * unpublished manuscripts use "Book" with free excerpt availability to avoid invalid Product offers.
 */
export function buildBookStructuredData(
  book: Book,
  baseUrl: string,
  isMaintenanceMode: boolean,
  includeContext: boolean = false
): Record<string, unknown> {
  const bookUrl = getBookCanonicalUrl(book.id, baseUrl);
  const validIsbn = parseValidIsbn13(book.isbn);
  const fullName = book.subtitle ? `${book.title} — ${book.subtitle}` : book.title;
  const description =
    book.shortDescription ||
    (book.fullSynopsis && book.fullSynopsis[0]) ||
    `${fullName} par ${book.author}`;

  const sameAs = Array.from(
    new Set([book.amazonUrl, book.kindleUrl, book.amazonKindleUrl].filter(Boolean) as string[])
  );

  const paperAvailability = isMaintenanceMode
    ? 'https://schema.org/OutOfStock'
    : book.inStock > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/PreOrder';

  const digitalAvailability = isMaintenanceMode
    ? 'https://schema.org/OutOfStock'
    : 'https://schema.org/InStock';

  const sellerRef = {
    '@type': 'Organization',
    '@id': `${baseUrl}#publisher`,
    name: book.publisher || 'Éditions Émile Mourey'
  };

  const baseBookData: Record<string, unknown> = {
    ...(includeContext ? { '@context': 'https://schema.org' } : {}),
    '@id': `${bookUrl}#book`,
    '@type': book.isUnpublished ? 'Book' : ['Book', 'Product'],
    name: fullName,
    alternateName: book.title,
    description,
    url: bookUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': bookUrl
    },
    inLanguage: 'fr',
    author: {
      '@type': 'Person',
      '@id': `${baseUrl}#author`,
      name: book.author
    },
    publisher: sellerRef,
    datePublished: String(book.publicationYear),
    numberOfPages: book.pages,
    genre: book.category,
    ...(book.tome ? { bookEdition: book.tome } : {}),
    ...(validIsbn ? { isbn: validIsbn.formatted } : {}),
    bookFormat: book.isUnpublished
      ? 'https://schema.org/EBook'
      : 'https://schema.org/Paperback',
    ...(sameAs.length > 0 ? { sameAs } : {})
  };

  if (book.isUnpublished) {
    return {
      ...baseBookData,
      isAccessibleForFree: true
    };
  }

  // Commercial book: attach full Product metadata, Book editions (workExample), and Offers
  const offers: Record<string, unknown>[] = [];

  if (typeof book.price === 'number' && book.price > 0) {
    offers.push({
      '@type': 'Offer',
      name: 'Édition Papier Broché (Dédicace offerte)',
      price: book.price.toFixed(2),
      priceCurrency: 'EUR',
      availability: paperAvailability,
      itemCondition: 'https://schema.org/NewCondition',
      url: bookUrl,
      seller: sellerRef
    });
  }

  if (book.canBuyPdf !== false && typeof book.priceEbook === 'number' && book.priceEbook > 0) {
    offers.push({
      '@type': 'Offer',
      name: 'Édition Numérique (PDF)',
      price: book.priceEbook.toFixed(2),
      priceCurrency: 'EUR',
      availability: digitalAvailability,
      itemCondition: 'https://schema.org/NewCondition',
      url: bookUrl,
      seller: sellerRef
    });
  }

  if (typeof book.priceCombo === 'number' && book.priceCombo > 0) {
    offers.push({
      '@type': 'Offer',
      name: 'Pack Duo (Livre Papier Broché + PDF)',
      price: book.priceCombo.toFixed(2),
      priceCurrency: 'EUR',
      availability: paperAvailability,
      itemCondition: 'https://schema.org/NewCondition',
      url: bookUrl,
      seller: sellerRef
    });
  }

  const workExample: Record<string, unknown>[] = [
    {
      '@type': 'Book',
      '@id': `${bookUrl}#edition-paperback`,
      bookFormat: 'https://schema.org/Paperback',
      inLanguage: 'fr',
      numberOfPages: book.pages,
      ...(validIsbn ? { isbn: validIsbn.formatted } : {}),
      offers: offers[0]
    }
  ];

  if (book.canBuyPdf !== false && offers[1]) {
    workExample.push({
      '@type': 'Book',
      '@id': `${bookUrl}#edition-ebook`,
      bookFormat: 'https://schema.org/EBook',
      inLanguage: 'fr',
      numberOfPages: book.pages,
      offers: offers[1]
    });
  }

  return {
    ...baseBookData,
    sku: book.id,
    ...(validIsbn ? { gtin13: validIsbn.gtin13 } : {}),
    brand: {
      '@type': 'Brand',
      name: book.publisher || 'Éditions Émile Mourey'
    },
    category: book.category,
    ...(book.weightGrams > 0
      ? {
          weight: {
            '@type': 'QuantitativeValue',
            value: book.weightGrams,
            unitCode: 'GRM'
          }
        }
      : {}),
    workExample,
    offers: offers.length === 1 ? offers[0] : offers
  };
}

/**
 * Builds the full catalog JSON-LD @graph containing WebSite, Organization/BookStore,
 * Author (Person), and ItemList with every Book & Product entry.
 */
export function buildCatalogGraphJsonLd(
  books: Book[],
  baseUrl: string,
  isMaintenanceMode: boolean
) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}#website`,
        url: baseUrl,
        name: 'Éditions Émile Mourey - Librairie Historique',
        inLanguage: 'fr-FR',
        publisher: { '@id': `${baseUrl}#publisher` }
      },
      buildPublisherEntity(baseUrl),
      buildAuthorEntity(baseUrl),
      {
        '@type': 'ItemList',
        '@id': `${baseUrl}#catalog`,
        name: "Catalogue Officiel des Ouvrages d'Émile Mourey",
        url: baseUrl,
        numberOfItems: books.length,
        itemListElement: books.map((book, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: getBookCanonicalUrl(book.id, baseUrl),
          item: buildBookStructuredData(book, baseUrl, isMaintenanceMode, false)
        }))
      },
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Où Émile Mourey situe-t-il Bibracte et quel rôle attribue-t-il au mont Beuvray ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Dans Histoire de Bibracte et La Gaule en héritage, Émile Mourey situe la capitale éduenne de Bibracte au Mont-Saint-Vincent (Saône-et-Loire) en s'appuyant sur l'expression itinere converso de César et la Table de Peutinger, et identifie le mont Beuvray à l'oppidum militaire de Gorgobina. L'archéologie officielle (CNRS, revue Gallia 55) maintient l'identification de Bibracte au mont Beuvray."
            }
          },
          {
            '@type': 'Question',
            name: "Quelle est la thèse d'Émile Mourey sur le siège d'Alésia et l'expression altero die ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Émile Mourey relit altero die (« le surlendemain ») dans le livre VII du De Bello Gallico pour décaler la bataille de cavalerie vers Noyers-sur-Serein et situer l'assaut principal de Vercassivellaunos sur la montagne de Bussy (422 m), tout en discutant les fouilles franco-allemandes d'Alise-Sainte-Reine (M. Reddé & S. von Schnurbein, CRAI 1995)."
            }
          },
          {
            '@type': 'Question',
            name: "Où Émile Mourey localise-t-il Gergovie par rapport au consensus archéologique ?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Dans Histoire de Gergovie (Tome 1), Émile Mourey conteste le plateau officiel de Merdogne au profit de l'éperon du Crest en Auvergne. Les fouilles INRAP et CNRS (Yann Deberge, Matthieu Poux, RACF) confortent l'identification du plateau de Gergovie-Merdogne."
            }
          }
        ]
      }
    ]
  };
}

/**
 * Builds focused JSON-LD structured data for a single active book (Book + Product + BreadcrumbList).
 */
export function buildActiveBookGraphJsonLd(
  book: Book,
  baseUrl: string,
  isMaintenanceMode: boolean
) {
  const bookUrl = getBookCanonicalUrl(book.id, baseUrl);
  const fullName = book.subtitle ? `${book.title} — ${book.subtitle}` : book.title;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildBookStructuredData(book, baseUrl, isMaintenanceMode, false),
      {
        '@type': 'BreadcrumbList',
        '@id': `${bookUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Catalogue Éditions Émile Mourey',
            item: baseUrl
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: book.category,
            item: baseUrl
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: fullName,
            item: bookUrl
          }
        ]
      }
    ]
  };
}

export interface AgoraVoxTestimonialCard {
  id: string;
  kind: 'testimonial';
  badge: string;
  title: string;
  quote: string;
  readerLabel: string;
  context: string;
  sourceNote: string;
}

export interface AgoraVoxDebateCard {
  id: string;
  kind: 'debate';
  badge: string;
  title: string;
  objectionAuthor: string;
  objectionText: string;
  authorReplyName: string;
  authorReplyText: string;
  context: string;
}

export interface AgoraVoxArchiveCtaCard {
  id: string;
  kind: 'archive_cta';
  badge: string;
  title: string;
  articleCount: number;
  description: string;
  agoravoxUrl: string;
  agoravoxCtaLabel: string;
  catalogCtaLabel: string;
}

export type AgoraVoxCard =
  | AgoraVoxTestimonialCard
  | AgoraVoxDebateCard
  | AgoraVoxArchiveCtaCard;

/**
 * Fichier dédié aux cartes éditoriales du bloc « Voix d'AgoraVox ».
 * Modifiez librement les citations, libellés ou liens ci-dessous :
 * la section « Méthode et Controverse » se mettra automatiquement à jour.
 */
export const AGORAVOX_META = {
  authorProfileUrl: 'https://www.agoravox.fr/auteur/emile-mourey',
  articleCount: 563,
  sectionSubtitle:
    'Extraits représentatifs des discussions publiées sur AgoraVox autour de la méthode militaire, de la topographie antique et de la confrontation des sources.'
};

export const AGORAVOX_CARDS: AgoraVoxCard[] = [
  {
    id: 'agoravox-clarte-tactique',
    kind: 'testimonial',
    badge: 'Clarté pédagogique & tactique',
    title: 'Lire César avec des yeux d’officier',
    quote:
      "Ce qui frappe dans les démonstrations d'Émile Mourey, c'est la limpidité tactique : distances de marche d'une légion, lignes de crête, contraintes d'approvisionnement en eau et angles de vue sur le terrain. Même sans être latiniste, on comprend enfin la mécanique militaire d'Alésia et de la campagne des Helvètes.",
    readerLabel: 'Lecteur commentateur · AgoraVox',
    context: 'Dossiers Alésia & Guerre des Gaules',
    sourceNote: 'Synthèse éditoriale issue des réactions de lecteurs'
  },
  {
    id: 'agoravox-echange-contradictoire',
    kind: 'debate',
    badge: 'Échange contradictoire',
    title: 'Texte latin contre consensus archéologique',
    objectionAuthor: 'Objection d’un lecteur',
    objectionText:
      "« Comment remettre en cause des décennies de fouilles officielles sur le mont Auxois ou le mont Beuvray en s'appuyant d'abord sur une retraduction de César et des hypothèses topographiques ? »",
    authorReplyName: 'Réponse d’Émile Mourey',
    authorReplyText:
      "« Il ne s'agit pas de nier les vestiges mis au jour, mais de vérifier s'ils correspondent réellement aux mouvements décrits par le témoin direct. Un fossé ou une monnaie prouvent une occupation militaire ou gauloise ; seule la cohérence entre le texte latin exact, les distances et le terrain permet d'identifier la bataille. »",
    context: 'Débat public sur la méthode de contre-enquête'
  },
  {
    id: 'agoravox-archives-catalogue',
    kind: 'archive_cta',
    badge: 'Archives & Ouvrages',
    title: 'Prolonger la contre-enquête',
    articleCount: 563,
    description:
      "Retrouvez l'ensemble des 563 articles publiés par Émile Mourey sur AgoraVox (Guerre des Gaules, Bibracte, Alésia, Gergovie et enquêtes sur les origines religieuses), ou découvrez les synthèses complètes, cartes et appareils critiques réunis dans le catalogue des Éditions Émile Mourey.",
    agoravoxUrl: 'https://www.agoravox.fr/auteur/emile-mourey',
    agoravoxCtaLabel: 'Consulter les 563 articles sur AgoraVox',
    catalogCtaLabel: 'Explorer le catalogue du site'
  }
];

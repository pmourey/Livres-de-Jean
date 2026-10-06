import { Book, Order, ClaimTicket, RelayPoint, UserAccount } from '../types';

export const GOOGLE_DRIVE_PDF_FOLDER = 'https://drive.google.com/drive/folders/17Y228r3cPkInk-smT1kF2tIHkxPUDwNU?usp=sharing';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'mourey-gergovie-tome-1',
    title: 'Histoire de Gergovie',
    subtitle: 'Tome 1 : La bataille gauloise et les légions de César',
    tome: 'Tome 1',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 1993,
    pages: 278,
    isbn: '978-2-9507295-1-4',
    isbn10: '2950729517',
    dimensions: '15 × 21 cm, broché avec cartes topographiques',
    weightGrams: 420,
    price: 22.0, // Papier
    priceEbook: 9.9, // Version numérique PDF
    priceCombo: 26.0, // Duo Papier + PDF
    category: 'Gergovie & Gaule',
    shortDescription:
      "Une relecture méthodique des textes antiques et des Commentaires de César confrontée au relief véritable du haut plateau et des lignes romaines.",
    fullSynopsis: [
      "Dans ce premier tome fondateur de ses recherches, Émile Mourey se penche sur l'un des affrontements les plus célèbres et les plus mal compris de la Guerre des Gaules : le siège de Gergovie par Jules César en 52 av. J.-C.",
      "En reprenant les distances exprimées en pas romains, le tracé des fossés doubles de communication et l'élévation des camps romains (le grand camp et le petit camp), l'auteur met en lumière les incohérences de l'historiographie conventionnelle et propose une reconstitution topographique rigoureuse.",
      "L'ouvrage s'appuie sur une étude approfondie de la tactique militaire césarienne et de la manœuvre de diversion des cavaliers gaulois commandés par Vercingétorix."
    ],
    tableOfContents: [
      'Avant-propos : Pourquoi réexaminer Gergovie ?',
      'Chapitre 1 : Les textes de César (Guerre des Gaules, Livre VII) au mot à mot',
      'Chapitre 2 : Les deux camps de César et le double fossé de liaison',
      'Chapitre 3 : La tentative d’escalade et l’échec cuisant de la Xe légion',
      'Chapitre 4 : La retraite de César et la traversée de l’Allier',
      'Conclusions topographiques et cartes comparatives'
    ],
    excerptTitle: 'Chapitre 2 : La configuration des camps romains',
    excerptPages: [
      "« César nous indique qu'ayant reconnu la position de la ville, qui était située sur une montagne très élevée et d'un accès difficile de tous côtés, il désespéra de la prendre d'assaut... Mais où se situait précisément la colline occupée par les Gaulois ? C'est le relief même du sol qui nous dicte la réponse tactique. »",
      "« Lorsqu'on examine les pentes avec les yeux d'un officier d'infanterie, les mouvements des légionnaires s'éclairent d'un jour nouveau : César cherchait avant tout à sécuriser son approvisionnement en blé menacé par les Éduens révoltés. »"
    ],
    inStock: 16,
    featured: true,
    coverBgColor: '#6B1D28', // Deep Burgundy
    coverAccentColor: '#D4AF37', // Gold
    motif: 'shield',
    amazonUrl: 'https://www.amazon.fr/dp/2950729517/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },
  {
    id: 'mourey-bibracte-tome-2-bouclier-eduen',
    title: 'Histoire de Bibracte',
    subtitle: 'Tome 2 : Le Bouclier Éduen',
    tome: 'Tome 2',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 1992,
    pages: 292,
    isbn: '978-2-9507295-0-7',
    isbn10: '2950729509',
    dimensions: '15 × 21 cm, broché avec plans de voies antiques',
    weightGrams: 440,
    price: 22.0,
    priceEbook: 9.9,
    priceCombo: 26.0,
    category: 'Histoire de Bibracte',
    shortDescription:
      "La thèse majeure d'Émile Mourey identifiant la capitale des Éduens sur le promontoire stratégique du Mont Saint-Vincent en Saône-et-Loire.",
    fullSynopsis: [
      "Où se dressait véritablement la métropole sacrée des Éduens, où César prit ses quartiers d'hiver pour rédiger ses Commentaires ? Dans ce tome 2, 'Le Bouclier Éduen', Émile Mourey présente les preuves géographiques et toponymiques qui désignent le Mont Saint-Vincent comme le véritable sanctuaire de la Gaule centrale.",
      "Face à la thèse académique du Mont Beuvray, l'auteur démontre l'incompatibilité climatique et logistique d'un oppidum perché au cœur du Morvan avec le rôle de nœud commercial et militaire international décrit par Strabon.",
      "Le 'bouclier éduen' symbolise la forteresse naturelle protégeant le peuple allié de Rome, au carrefour vital de la Loire et de la Saône."
    ],
    tableOfContents: [
      'Introduction : Le mystère de la capitale éduenne',
      'Chapitre 1 : Les voies commerciales de l’étain et du vin en Gaule',
      'Chapitre 2 : Le Mont Saint-Vincent : panorama sur quatorze départements',
      'Chapitre 3 : La bataille de Bibracte contre les Helvètes (58 av. J.-C.)',
      'Chapitre 4 : La géométrie sacrée du territoire éduen',
      'Épilogue : Rétablir la vérité pour le patrimoine bourguignon'
    ],
    excerptTitle: 'Chapitre 2 : Le promontoire du Mont Saint-Vincent',
    excerptPages: [
      "« Du sommet du Mont Saint-Vincent, la vue embrasse la totalité du pays éduen. C'est ici, sur ce plateau calcaire dominant les axes fluviaux, que battait le cœur politique de la Gaule avant la conquête. »",
      "« Comment imaginer que les chefs éduens, maîtres de la diplomatie gauloise, aient choisi un sommet battu par les vents et isolé dans les forêts du Morvan pour tenir les assemblées générales de toutes les cités de Gaule ? »"
    ],
    inStock: 22,
    featured: true,
    coverBgColor: '#1E2D3D', // Deep Navy
    coverAccentColor: '#E6C687',
    motif: 'fortress',
    amazonUrl: 'https://www.amazon.fr/dp/2950729509/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },
  {
    id: 'mourey-bibracte-tome-3-epee-flamboyante',
    title: 'Histoire de Bibracte',
    subtitle: "Tome 3 : L'Épée Flamboyante",
    tome: 'Tome 3',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 1994,
    pages: 284,
    isbn: '978-2-9507295-2-1',
    isbn10: '2950729525',
    dimensions: '15 × 21 cm, broché',
    weightGrams: 430,
    price: 22.0,
    priceEbook: 9.9,
    priceCombo: 26.0,
    category: 'Histoire de Bibracte',
    shortDescription:
      "L'épopée militaire et la métallurgie sacrée des forgerons gaulois. Le rôle des armes éduennes et la ferveur celtique.",
    fullSynopsis: [
      "Le tome 3 de l'Histoire de Bibracte explore le rôle militaire, technique et spirituel de l'armement gaulois à l'époque de la conquête romaine.",
      "Les Éduens possédaient une renommée inégalée pour l'artisanat du fer et du bronze. À travers 'L'Épée Flamboyante', Émile Mourey analyse la symbolique guerrière des épées longues celtiques à deux tranchants et le rituel sacré de consécration des armes aux dieux du panthéon gaulois.",
      "L'ouvrage lève également le voile sur la diplomatie armée menée par Dumnorix face aux manœuvres de César."
    ],
    tableOfContents: [
      'Chapitre 1 : Les maîtres de la forge et du minerai en Bourgogne',
      'Chapitre 2 : L’épée celtique face au glaive romain : tactique de duel',
      'Chapitre 3 : Dumnorix le rebelle et l’escadron des mille cavaliers',
      'Chapitre 4 : Les sanctuaires d’armes consacrées et les sources sacrées',
      'Chapitre 5 : Le drame de 52 av. J.-C. : l’ultime serment de Bibracte'
    ],
    excerptTitle: 'Chapitre 3 : La cavalerie de Dumnorix',
    excerptPages: [
      "« L'épée flamboyante n'est pas une simple allégorie poétique : elle renvoie à la trempe particulière de l'acier gaulois forgé au cœur des fourneaux éduens. Dumnorix savait que l'indépendance de son peuple reposait sur la maîtrise de cette métallurgie d'élite. »"
    ],
    inStock: 14,
    featured: false,
    coverBgColor: '#243D30', // Antique Forest Green
    coverAccentColor: '#DFBD74',
    motif: 'laurel',
    amazonUrl: 'https://www.decitre.fr/livres/histoire-de-bibracte-9782950729521.html',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },
  {
    id: 'mourey-bibracte-tome-4-dieu-rayonnant',
    title: 'Histoire de Bibracte',
    subtitle: 'Tome 4 : Dieu Rayonnant',
    tome: 'Tome 4',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 1996,
    pages: 310,
    isbn: '978-2-9507295-3-8',
    isbn10: '2950729533',
    dimensions: '15 × 21 cm, broché',
    weightGrams: 460,
    price: 22.0,
    priceEbook: 9.9,
    priceCombo: 26.0,
    category: 'Histoire de Bibracte',
    shortDescription:
      "Les cultes solaires, les alignements astronomiques et la religion des druides au cœur des sanctuaires de Gaule centrale.",
    fullSynopsis: [
      "Dans 'Dieu Rayonnant', Émile Mourey aborde la dimension religieuse et cosmologique de la civilisation gauloise.",
      "Loin de la vision primitive complaisamment diffusée par la propagande romaine, les druides possédaient une connaissance mathématique et astronomique raffinée de la rotation des astres et du calendrier luni-solaire de Coligny.",
      "L'auteur examine l'orientation des lieux de culte de Saône-et-Loire par rapport au lever du soleil aux solstices et la filiation entre la divinité solaire gauloise (Belenos / Lug) et les premières dévotions gallo-romaines."
    ],
    tableOfContents: [
      'Chapitre 1 : Le panthéon gaulois : Lug, Belenos et Taranis',
      'Chapitre 2 : Le calendrier de Coligny et la science astronomique druidique',
      'Chapitre 3 : Les orientations solaires des temples et des oppida',
      'Chapitre 4 : La colline rayonnante : topographie cultuelle du Mont Saint-Vincent',
      'Chapitre 5 : Du culte solaire celtique à l’avènement de la lumière chrétienne'
    ],
    excerptTitle: 'Chapitre 2 : La science des prêtres gaulois',
    excerptPages: [
      "« César lui-même concédait dans ses notes que les druides disputent longuement des astres et de leur mouvement, de la grandeur du monde et de la terre. Ce 'Dieu rayonnant' qui illuminait les sommets consacrés n'était autre que le principe régulateur des saisons agricoles et civiques. »"
    ],
    inStock: 18,
    featured: false,
    coverBgColor: '#5A2E1A', // Terracotta Gold
    coverAccentColor: '#F5C77E',
    motif: 'scroll',
    amazonUrl: 'https://www.amazon.fr/dp/2950729533/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },
  {
    id: 'mourey-bibracte-tome-5-dieu-cache',
    title: 'Histoire de Bibracte',
    subtitle: 'Tome 5 : Dieu Caché',
    tome: 'Tome 5',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 1998,
    pages: 298,
    isbn: '978-2-9507295-4-5',
    isbn10: '2950729541',
    dimensions: '15 × 21 cm, broché',
    weightGrams: 450,
    price: 22.0,
    priceEbook: 9.9,
    priceCombo: 26.0,
    category: 'Histoire de Bibracte',
    shortDescription:
      "Le secret des initiations gauloises, les cryptes sacrées et la transmission occulte du patrimoine religieux après la romanisation.",
    fullSynopsis: [
      "Cinquième volume de la grande fresque historique de Bibracte, 'Dieu Caché' clôture l'exploration du monde éduen en se penchant sur la part secrète de la tradition celtique.",
      "Pourquoi les druides interdisaient-ils formellement de coucher par écrit leurs doctrines théologiques ? Comment la mémoire gauloise a-t-elle survécu aux interdictions d'Auguste et de Claude ?",
      "Émile Mourey retrace le passage souterrain des symboles celtiques dans les cryptes romanes de Bourgogne, le culte des Vierges Noires et la toponymie des forêts profondes du pays de Charolles et d'Autun."
    ],
    tableOfContents: [
      'Chapitre 1 : Le tabou de l’écriture et la mémoire orale millénaire',
      'Chapitre 2 : Les sanctuaires des eaux souterraines et des gouffres',
      'Chapitre 3 : La résistance spirituelle après Alésia et l’interdiction romaine',
      'Chapitre 4 : La survivance du culte dans les églises romanes bourguignonnes',
      'Synthèse générale : Le leg impérissable des Éduens'
    ],
    excerptTitle: 'Chapitre 3 : La mémoire sous le voile',
    excerptPages: [
      "« Le Dieu caché, c'est cette présence persistante qui traverse les siècles sans que le conquistador ne puisse l'extirper. Lorsque les légions de Rome ont cru avoir écrasé la Gaule, celle-ci s'est réfugiée dans le silence de ses collines et la pérennité de ses rites ruraux. »"
    ],
    inStock: 15,
    featured: false,
    coverBgColor: '#25242C', // Dark Slate
    coverAccentColor: '#D97706',
    motif: 'shield',
    amazonUrl: 'https://www.amazon.fr/dp/2950729541/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },
  {
    id: 'mourey-christ-tome-1',
    title: 'Histoire du Christ',
    subtitle: 'Tome 1 : Enquête sur les origines et les sources antiques',
    tome: 'Tome 1',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 2000,
    pages: 340,
    isbn: '978-2-9507295-5-2',
    isbn10: '295072955X',
    dimensions: '15 × 21 cm, broché',
    weightGrams: 490,
    price: 24.0,
    priceEbook: 10.9,
    priceCombo: 28.0,
    category: 'Histoire du Christ',
    shortDescription:
      "Une enquête historique minutieuse confrontant les évangiles, les historiens romains (Tacite, Suétone) et les manuscrits antiques.",
    fullSynopsis: [
      "Émile Mourey applique sa rigueur méthodologique de chercheur indépendant à l'un des plus grands mystères de l'histoire humaine : la vie et le contexte historique du Christ.",
      "En replaçant chaque récit évangélique dans l'administration provinciale romaine de Judée sous Tibère et Ponce Pilate, l'auteur examine les textes avec le regard du juriste et du topographe.",
      "Ce tome 1 analyse les sources documentaires, la géographie des déplacements, les lois pénales romaines et la confrontation politique avec le pouvoir sacerdotal."
    ],
    tableOfContents: [
      'Introduction : La quête de l’historicité rigoureuse',
      'Chapitre 1 : L’empire de Tibère et l’administration de la Judée romaine',
      'Chapitre 2 : La confrontation des sources : évangiles, Flavius Josèphe, Tacite',
      'Chapitre 3 : Topographie des lieux saints et réalités archéologiques',
      'Chapitre 4 : Le procès sous Ponce Pilate au regard du droit romain',
      'Chapitre 5 : Les premiers cercles de témoins et la transmission primitive'
    ],
    excerptTitle: 'Chapitre 4 : L’épreuve du prétoire romain',
    excerptPages: [
      "« Ponce Pilate n'était pas un philosophe en quête de vérité métaphysique, mais un procurateur impérial soucieux de l'ordre public de l'Empire. Pour comprendre le dénouement du procès, il faut scruter les règles impératives de la lex Iulia de maiestate... »"
    ],
    inStock: 19,
    featured: true,
    coverBgColor: '#3B1B2B', // Royal Plum
    coverAccentColor: '#E2B86E',
    motif: 'cross',
    amazonUrl: 'https://www.amazon.fr/dp/295072955X/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },
  {
    id: 'mourey-christ-tome-2',
    title: 'Histoire du Christ',
    subtitle: "Tome 2 : La diffusion et l'empreinte gallo-romaine",
    tome: 'Tome 2',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 2002,
    pages: 356,
    isbn: '978-2-9507295-6-9',
    isbn10: '2950729568',
    dimensions: '15 × 21 cm, broché',
    weightGrams: 510,
    price: 24.0,
    priceEbook: 10.9,
    priceCombo: 28.0,
    category: 'Histoire du Christ',
    shortDescription:
      "La pénétration des premières communautés chrétiennes dans l'Empire et l'éclosion des sanctuaires en Gaule et en Bourgogne.",
    fullSynopsis: [
      "Dans le prolongement du premier tome, ce second volume explore la diffusion du message chrétien le long des voies de communication romaines vers la Gaule.",
      "Comment les marchands orientaux, les légions et les premiers prédicateurs ont-ils remonté la vallée du Rhône et de la Saône jusqu'à Lyon, Autun et Chalon ?",
      "Émile Mourey étudie les premières épitaphes, les catacombes, la confrontation avec le paganisme gaulois et la métamorphose de l'Occident chrétien."
    ],
    tableOfContents: [
      'Chapitre 1 : Les routes maritimes et terrestres des premiers apôtres',
      'Chapitre 2 : L’axe rhodanien : de Massilia aux cités de Bourgogne',
      'Chapitre 3 : Les martyrs de Lyon de 177 et la mémoire éduenne',
      'Chapitre 4 : La conversion des élites sénatoriales gallo-romaines',
      'Épilogue : De la Gaule antique à la France médiévale'
    ],
    excerptTitle: 'Chapitre 2 : La remontée de la Saône',
    excerptPages: [
      "« C'est par les mêmes bateaux de bateliers qui transportaient l'huile et les amphores méditerranéennes que la nouvelle foi a gagné les quais d'Autun et les collines de Saône-et-Loire. L'histoire du christianisme occidental s'est écrite sur nos fleuves. »"
    ],
    inStock: 17,
    featured: false,
    coverBgColor: '#34281E', // Dark Ochre
    coverAccentColor: '#DFBD74',
    motif: 'cross',
    amazonUrl: 'https://www.amazon.fr/dp/2950729568/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },
  {
    id: 'mourey-coffret-integrale-bibracte',
    title: 'Intégrale Histoire de Bibracte',
    subtitle: 'Coffret 4 Volumes (Tomes 2, 3, 4 et 5) dédicacé par l’Auteur',
    tome: 'Coffret 4 Tomes',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 2024,
    pages: 1184,
    isbn: '978-2-9507295-9-0',
    dimensions: 'Coffret 4 volumes brochés + dépliant cartographique grand format',
    weightGrams: 1780,
    price: 79.0, // Papier
    priceEbook: 29.9, // 4 tomes en PDF
    priceCombo: 89.0, // Papier + 4 PDF
    originalPrice: 88.0,
    category: 'Coffrets & Intégrales',
    shortDescription:
      "La grande fresque intégrale d'Émile Mourey sur Bibracte réunie : Le Bouclier Éduen, L'Épée Flamboyante, Dieu Rayonnant et Dieu Caché.",
    fullSynopsis: [
      "Le chef-d'œuvre de recherche d'Émile Mourey enfin réuni dans un coffret de prestige.",
      "Comprend l'ensemble des 4 tomes consacrés à Bibracte et au Mont Saint-Vincent, accompagnés d'un dépliant cartographique haute résolution des voies antiques éduennes.",
      "Livraison Colissimo offerte à domicile et dédicace calligraphiée personnalisée de l'auteur incluse."
    ],
    tableOfContents: [
      'Tome 2 : Le Bouclier Éduen (292 pages)',
      'Tome 3 : L’Épée Flamboyante (284 pages)',
      'Tome 4 : Dieu Rayonnant (310 pages)',
      'Tome 5 : Dieu Caché (298 pages)',
      'Bonus : Carte grand format des oppida éduens en Saône-et-Loire'
    ],
    excerptTitle: 'Note éditoriale sur l’Intégrale',
    excerptPages: [
      "« Rassembler ces quatre volets, c'est offrir aux amoureux d'histoire et de patrimoine la vision complète de ce que fut la plus puissante république de la Gaule centrale. »"
    ],
    inStock: 9,
    featured: true,
    coverBgColor: '#2F1810',
    coverAccentColor: '#F59E0B',
    motif: 'fortress',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },
  {
    id: 'mourey-duo-histoire-du-christ',
    title: 'Histoire du Christ (Les 2 Tomes)',
    subtitle: 'Enquête historique intégrale en 2 Volumes dédicacés par l’Auteur',
    tome: 'Duo 2 Tomes',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 2024,
    pages: 696,
    isbn: '978-2-9507295-8-3',
    dimensions: 'Ensemble de 2 tomes brochés sous emballage renforcé',
    weightGrams: 1000,
    price: 44.0, // Papier
    priceEbook: 16.9, // 2 tomes PDF
    priceCombo: 49.0, // Papier + 2 PDF
    originalPrice: 48.0,
    category: 'Coffrets & Intégrales',
    shortDescription:
      "L'enquête intégrale en 2 volumes sur les sources antiques, le procès de Pilate et la diffusion gallo-romaine.",
    fullSynopsis: [
      "Les deux tomes de l'Histoire du Christ réunis pour une lecture fluide et documentée.",
      "Une approche rigoureusement historique et topographique par Émile Mourey.",
      "Chaque exemplaire est dédicacé par l'auteur sur simple demande."
    ],
    tableOfContents: [
      'Tome I : Enquête sur les origines et les sources antiques (340 pages)',
      'Tome II : La diffusion et l’empreinte gallo-romaine (356 pages)'
    ],
    excerptTitle: 'Présentation du diptyque',
    excerptPages: [
      "« Ce diptyque permet d'appréhender le passage de l'événement antique judéen à l'épanouissement de la première chrétienté gallo-romaine. »"
    ],
    inStock: 11,
    featured: true,
    coverBgColor: '#281525',
    coverAccentColor: '#E6C687',
    motif: 'cross',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  }
];

export const INITIAL_RELAY_POINTS: RelayPoint[] = [
  {
    id: 'relay-1',
    name: 'Maison de la Presse & Papeterie',
    address: '14 Rue du Général Leclerc',
    postalCode: '71200',
    city: 'Le Creusot',
    distanceKm: 0.8,
    carrier: 'Point Relais La Poste / Pickup',
    hours: 'Lun-Sam : 07h30 - 19h00'
  },
  {
    id: 'relay-2',
    name: 'Librairie & Tabac Saint-Vincent',
    address: '3 Place de l’Église',
    postalCode: '71300',
    city: 'Montceau-les-Mines',
    distanceKm: 4.2,
    carrier: 'Mondial Relay / Relais Colis',
    hours: 'Mar-Sam : 08h00 - 19h30, Dim : 08h30 - 12h30'
  },
  {
    id: 'relay-3',
    name: 'Station Relais Total & Presse',
    address: '45 Avenue de la République',
    postalCode: '71400',
    city: 'Autun',
    distanceKm: 12.5,
    carrier: 'Point Relais La Poste / Colissimo',
    hours: '7j/7 : 06h00 - 21h00'
  },
  {
    id: 'relay-4',
    name: 'Super U Relais Colis',
    address: 'Route de Chalon',
    postalCode: '71100',
    city: 'Chalon-sur-Saône',
    distanceKm: 18.0,
    carrier: 'Mondial Relay / Pickup',
    hours: 'Lun-Sam : 08h30 - 20h00'
  }
];

export const DEMO_CUSTOMER: UserAccount = {
  id: 'cust-demo-1',
  email: 'philippe.mourey@gmail.com',
  firstName: 'Philippe',
  lastName: 'Mourey',
  phone: '06 12 34 56 78',
  shippingAddress: {
    street: '18 Rue des Éduens',
    postalCode: '71200',
    city: 'Le Creusot',
    country: 'France'
  },
  billingAddress: {
    street: '18 Rue des Éduens',
    postalCode: '71200',
    city: 'Le Creusot',
    country: 'France'
  }
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'CMD-2026-0210',
    date: '2026-10-05',
    customer: {
      firstName: 'Philippe',
      lastName: 'Mourey',
      email: 'philippe.mourey@gmail.com',
      phone: '06 12 34 56 78',
      street: '18 Rue des Éduens',
      postalCode: '71200',
      city: 'Le Creusot',
      country: 'France'
    },
    items: [
      {
        bookId: 'mourey-gergovie-tome-1',
        title: 'Histoire de Gergovie : Tome 1',
        format: 'numerique_pdf',
        unitPrice: 9.9,
        quantity: 1,
        weightGrams: 0,
        dedicationRequested: false,
        digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
      },
      {
        bookId: 'mourey-bibracte-tome-2-bouclier-eduen',
        title: 'Histoire de Bibracte : Tome 2 (Le Bouclier Éduen)',
        format: 'numerique_pdf',
        unitPrice: 9.9,
        quantity: 1,
        weightGrams: 0,
        dedicationRequested: false,
        digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
      }
    ],
    subtotal: 19.8,
    shippingMethod: 'telechargement_numerique',
    shippingCost: 0.0,
    total: 19.8,
    totalWeightGrams: 0,
    paymentMethod: 'stripe_card',
    paymentStatus: 'paye',
    orderStatus: 'livree',
    invoiceNumber: 'FAC-2026-0210',
    notes: 'Commande de versions numériques PDF payée en ligne. Téléchargements activés.'
  },
  {
    id: 'CMD-2026-0182',
    date: '2026-09-28',
    customer: {
      firstName: 'Philippe',
      lastName: 'Mourey',
      email: 'philippe.mourey@gmail.com',
      phone: '06 12 34 56 78',
      street: '18 Rue des Éduens',
      postalCode: '71200',
      city: 'Le Creusot',
      country: 'France'
    },
    items: [
      {
        bookId: 'mourey-gergovie-tome-1',
        title: 'Histoire de Gergovie : Tome 1',
        format: 'papier',
        unitPrice: 22.0,
        quantity: 1,
        weightGrams: 420,
        dedicationRequested: true,
        dedicationRecipient: 'Philippe Mourey',
        dedicationMessage: 'Avec mes hommages et toute mon amitié pour votre passion de la Bourgogne.'
      },
      {
        bookId: 'mourey-bibracte-tome-2-bouclier-eduen',
        title: 'Histoire de Bibracte : Tome 2 (Le Bouclier Éduen)',
        format: 'papier',
        unitPrice: 22.0,
        quantity: 1,
        weightGrams: 440,
        dedicationRequested: false
      }
    ],
    subtotal: 44.0,
    shippingMethod: 'colissimo_standard',
    shippingCost: 6.95,
    total: 50.95,
    totalWeightGrams: 860,
    paymentMethod: 'stripe_card',
    paymentStatus: 'paye',
    orderStatus: 'livree',
    trackingNumber: '8V01928374829',
    trackingHistory: [
      { date: '2026-09-28 14:10', status: 'Paiement Carte Bancaire validé (Stripe 3D-Secure)', location: 'Boutique en ligne' },
      { date: '2026-09-29 09:30', status: 'Colis préparé et dédicacé par l’auteur Émile Mourey', location: 'Atelier de Saône-et-Loire' },
      { date: '2026-09-29 16:45', status: 'Pris en charge au bureau de poste La Poste', location: 'Plateforme Colissimo Bourgogne' },
      { date: '2026-09-30 08:20', status: 'En cours de distribution par le facteur', location: 'Centre de tri Le Creusot' },
      { date: '2026-09-30 11:15', status: 'Livré en boîte aux lettres', location: 'Le Creusot' }
    ],
    invoiceNumber: 'FAC-2026-0182',
    notes: 'Exemplaire dédicacé avec soin.'
  },
  {
    id: 'CMD-2026-0195',
    date: '2026-10-02',
    customer: {
      firstName: 'Henri',
      lastName: 'Delorme',
      email: 'henri.delorme@wanadoo.fr',
      phone: '06 88 44 22 11',
      street: '4 Place Saint-Lazare',
      postalCode: '71400',
      city: 'Autun',
      country: 'France'
    },
    items: [
      {
        bookId: 'mourey-coffret-integrale-bibracte',
        title: 'Intégrale Histoire de Bibracte (4 Volumes)',
        format: 'papier',
        unitPrice: 79.0,
        quantity: 1,
        weightGrams: 1780,
        dedicationRequested: true,
        dedicationRecipient: 'Pour Henri Delorme',
        dedicationMessage: 'À la mémoire vivante de notre glorieuse cité d’Augustodunum et du Mont Saint-Vincent.'
      }
    ],
    subtotal: 79.0,
    shippingMethod: 'colissimo_standard',
    shippingCost: 0.0, // Franco de port
    total: 79.0,
    totalWeightGrams: 1780,
    paymentMethod: 'cheque_postal',
    paymentStatus: 'en_attente',
    orderStatus: 'attente_cheque',
    notes: 'Chèque postal de 79,00 € à l’ordre d’Émile Mourey expédié par courrier postal.'
  },
  {
    id: 'CMD-2026-0201',
    date: '2026-10-04',
    customer: {
      firstName: 'Monique',
      lastName: 'Lambert',
      email: 'm.lambert@free.fr',
      phone: '06 55 77 99 11',
      street: '12 Rue des Granges',
      postalCode: '21000',
      city: 'Dijon',
      country: 'France'
    },
    items: [
      {
        bookId: 'mourey-christ-tome-1',
        title: 'Histoire du Christ : Tome 1',
        format: 'papier',
        unitPrice: 24.0,
        quantity: 1,
        weightGrams: 490,
        dedicationRequested: false
      }
    ],
    subtotal: 24.0,
    shippingMethod: 'colissimo_standard',
    shippingCost: 4.95,
    total: 28.95,
    totalWeightGrams: 490,
    paymentMethod: 'paypal',
    paymentStatus: 'paye',
    orderStatus: 'en_preparation',
    notes: 'Règlement PayPal immédiat.'
  }
];

export const INITIAL_CLAIMS: ClaimTicket[] = [
  {
    id: 'SAV-2026-0041',
    orderId: 'CMD-2026-0182',
    customerEmail: 'philippe.mourey@gmail.com',
    customerName: 'Philippe Mourey',
    createdAt: '2026-10-01 14:30',
    subject: 'Question concernant le Tome 2 de Bibracte',
    reason: 'autre',
    status: 'resolu',
    messages: [
      {
        id: 'msg-1',
        sender: 'client',
        senderName: 'Philippe Mourey',
        text: 'Bonjour Monsieur Mourey, j’ai bien reçu Histoire de Gergovie et Histoire de Bibracte tome 2 avec votre magnifique dédicace. Je souhaitais savoir si le Tome 3 (L’Épée Flamboyante) était également disponible immédiatement pour commander la suite ? Merci pour votre formidable travail de recherche.',
        timestamp: '2026-10-01 14:30'
      },
      {
        id: 'msg-2',
        sender: 'auteur',
        senderName: 'Émile Mourey (Auteur)',
        text: 'Cher lecteur, merci infiniment pour vos aimables encouragements. Oui, le Tome 3 est en stock et je vous le dédicacerai avec plaisir. Vous pouvez le commander directement sur le catalogue avec la livraison offerte dès 55 € ! Bien à vous, Émile Mourey.',
        timestamp: '2026-10-01 17:15'
      }
    ]
  }
];

export const AUTHOR_INFO = {
  name: 'Monsieur Émile Mourey',
  role: 'Historien, Chercheur indépendant & Auteur auto-édité',
  siren: '418 122 883',
  activityCode: '5811Z - Édition de livres',
  legalForm: 'Micro-entreprise / Entrepreneur individuel (Auto-éditeur)',
  registrationStatus: 'Dispensé d’immatriculation au RCS (art. L 123-1-1 du Code de commerce)',
  tvaStatus: 'TVA non applicable, art. 293 B du Code Général des Impôts (CGI)',
  bankAffiliation: 'La Banque Postale',
  postalAddress: 'Éditions Émile Mourey, 71200 Le Creusot (Bourgogne - Saône-et-Loire, France)',
  paypalAccount: 'Compte PayPal vérifié Émile Mourey',
  contactEmail: 'contact@editions-emile-mourey.fr',
  phone: '03 85 55 00 00'
};

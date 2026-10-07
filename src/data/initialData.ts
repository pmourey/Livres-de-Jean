import { Book, Order, ClaimTicket, RelayPoint, UserAccount } from '../types';

export const GOOGLE_DRIVE_PDF_FOLDER = 'https://drive.google.com/drive/folders/17Y228r3cPkInk-smT1kF2tIHkxPUDwNU?usp=sharing';

export const INITIAL_BOOKS: Book[] = [
  // 1. HISTOIRE DE GERGOVIE - TOME 1
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
    dimensions: '15 × 21 cm, broché avec cartes et relevés topographiques',
    weightGrams: 420,
    price: 22.0, // Format Papier broché
    priceEbook: 9.9, // Format Numérique PDF payant
    priceCombo: 26.0, // Pack Duo Papier + PDF
    category: 'Gergovie & Gaule',
    shortDescription:
      "Une relecture méthodique des Commentaires de César (Livre VII) confrontée au relief véritable du haut plateau du Crest et des lignes romaines.",
    fullSynopsis: [
      "Dans cet ouvrage fondateur paru en septembre 1993, Émile Mourey, ancien officier d'infanterie diplômé de Saint-Cyr, soumet l'affrontement de Gergovie (52 av. J.-C.) à une critique topographique et militaire sans concession.",
      "En reprenant au mot à mot le texte latin de Jules César (De Bello Gallico, Livre VII, chapitres 36 à 53), l'auteur met en évidence l'inadéquation manifeste du plateau officiel de Merdogne (rebaptisé 'Gergovie' sous Napoléon III) avec les données textuelles : distances en pas romains, largeur des défilés, hauteur des escarpements et manœuvres des cohortes.",
      "L'auteur démontre avec rigueur que le véritable oppidum de Gergovie occupait le site stratégique du Crest (Puy de Saint-Amand / Le Crest). Il y identifie avec précision l'implantation du grand camp romain et du petit camp de César, ainsi que le double fossé de communication de six pieds (duplici fossa sex pedum alto) creusé pour sécuriser le ravitaillement des légionnaires.",
      "L'ouvrage restitue minute par minute la manœuvre de diversion tentée par César, l'emballement héroïque mais désastreux de la 10e légion et la contre-attaque foudroyante des cavaliers et guerriers gaulois menés par Vercingétorix, infligeant à Rome la perte de 46 centurions et 700 légionnaires."
    ],
    tableOfContents: [
      'Avant-propos : Pourquoi réexaminer l’énigme de Gergovie ?',
      'Chapitre 1 : Le texte de César (Guerre des Gaules, Livre VII) au crible de l’art militaire',
      'Chapitre 2 : La fausse piste de Merdogne et les incohérences de l’archéologie officielle',
      'Chapitre 3 : La topographie du Crest : l’oppidum gaulois et son assiette défensive',
      'Chapitre 4 : Les deux camps de César et le double fossé de liaison de six pieds',
      'Chapitre 5 : La manœuvre de diversion et l’assaut avorté de la 10e légion',
      'Chapitre 6 : La retraite tactique de César et le passage périlleux de l’Allier',
      'Annexes & Cartographie : Relevés altimétriques comparatifs et calculs de marche'
    ],
    excerptTitle: 'Chapitre 4 : La réalité tactique des deux camps romains',
    excerptPages: [
      "« César nous indique qu'ayant reconnu la position de la ville, qui était située sur une montagne très élevée et d'un accès difficile de tous côtés, il désespéra de la prendre d'assaut... Mais où se situait précisément la colline occupée par les Gaulois ? C'est le relief même du sol qui nous dicte la réponse tactique. »",
      "« Lorsqu'on examine les pentes avec les yeux d'un officier d'infanterie, les mouvements des légionnaires s'éclairent d'un jour nouveau : César cherchait avant tout à sécuriser son approvisionnement en blé menacé par les Éduens révoltés. Il fit creuser un double fossé de six pieds de large reliant ses deux camps afin que deux hommes puissent s'y croiser à l'abri des traits. Aucun fossé de cette nature n'a jamais pu s'inscrire dans la topographie de Merdogne ; au Crest, il saute aux yeux de quiconque arpente le terrain boussole en main. »",
      "« Vercingétorix n'était pas un chef improvisé : il avait servi dans la cavalerie auxiliaire romaine et connaissait intimement les réflexes de son adversaire. À Gergovie, c'est lui qui impose son tempo à César. »"
    ],
    keyQuotes: [
      "« Les distances en pas romains données par César dans le Livre VII ne coïncident en rien avec le plateau officiel de Merdogne. En revanche, appliquées au site du Crest, chaque repli de terrain, chaque double fossé et chaque campement retrouve sa cohérence militaire absolue. »",
      "« César écrivit ses Commentaires pour justifier auprès du Sénat un échec sanglant qui faillit anéantir ses légions en Gaule centrale. »"
    ],
    inStock: 16,
    featured: true,
    coverBgColor: '#6B1D28', // Deep Burgundy
    coverAccentColor: '#D4AF37', // Gold
    motif: 'shield',
    amazonUrl: 'https://www.amazon.fr/dp/2950729517/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 2. HISTOIRE DE BIBRACTE - TOME 2 : LE BOUCLIER ÉDUEN
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
      "La thèse maîtresse d'Émile Mourey identifiant la capitale souveraine des Éduens sur le promontoire stratégique du Mont Saint-Vincent en Saône-et-Loire.",
    fullSynopsis: [
      "Où se dressait véritablement la métropole sacrée des Éduens, où César convoqua les assemblées de la Gaule et prit ses quartiers d'hiver pour rédiger ses Commentaires ?",
      "Dans cet ouvrage fondamental paru en 1992, Émile Mourey conteste la localisation convenue du Mont Beuvray. En croisant les géographes grecs et latins — Strabon (Géographie, IV), Diodore de Sicile et César (De Bello Gallico, I et VII) —, il démontre l'incompatibilité absolue d'un oppidum perché au cœur des brumes, des neiges et des forêts impénétrables du Morvan avec le rôle de métropole internationale, de nœud commercial de l'étain et du vin, et d'entrepôt politique de la Gaule centrale.",
      "L'auteur prouve que la véritable Bibracte se situait sur le promontoire culminant du Mont Saint-Vincent (71), à 603 mètres d'altitude, offrant un panorama unique embrassant quatorze départements. Ce 'bouclier' naturel dominait et verrouillait le seuil hydrographique vital entre le bassin de la Loire et celui de la Saône.",
      "L'ouvrage retrace également la célèbre bataille de 58 av. J.-C. livrée à proximité contre les 368 000 Helvètes en migration, et replace la cité éduenne comme le pivot diplomatique de toute l'Europe occidentale antique."
    ],
    tableOfContents: [
      'Introduction : Le mystère de la capitale sacrée des Éduens',
      'Chapitre 1 : Les voies commerciales de l’étain et du vin en Gaule (Strabon et Diodore de Sicile)',
      'Chapitre 2 : La critique du Mont Beuvray : impossibilités climatiques et logistiques',
      'Chapitre 3 : Le promontoire du Mont Saint-Vincent : belvédère stratégique sur quatorze départements',
      'Chapitre 4 : La bataille de Bibracte contre les Helvètes (58 av. J.-C.) sur le terrain éduen',
      'Chapitre 5 : La géométrie sacrée des confins de la Saône et de la Loire',
      'Épilogue : Rétablir la vérité historique pour le patrimoine de Bourgogne'
    ],
    excerptTitle: 'Chapitre 3 : Le promontoire souverain du Mont Saint-Vincent',
    excerptPages: [
      "« Du sommet du Mont Saint-Vincent, la vue embrasse la totalité du pays éduen. C'est ici, sur ce plateau calcaire dominant les axes fluviaux, que battait le cœur politique de la Gaule avant la conquête. »",
      "« Comment imaginer que les chefs éduens, maîtres de la diplomatie gauloise, aient choisi un sommet battu par les vents et isolé dans les forêts du Morvan pour tenir les assemblées générales de toutes les cités de Gaule ? Strabon nous parle d'une ville commerçante établie sur les grandes routes fluviales. Le Mont Saint-Vincent répond point par point à cette exigence. »",
      "« Le 'bouclier éduen' symbolise la forteresse naturelle protégeant le peuple allié de Rome, au carrefour vital de la Loire et de la Saône. »"
    ],
    keyQuotes: [
      "« Bibracte n'était pas un refuge forestier improvisé, mais le siège d'un Sénat républicain gaulois qui traitait d'égal à égal avec le Sénat romain sous le titre officiel de Frères et Alliés du peuple romain. »",
      "« Le Mont Saint-Vincent offre le seul observatoire militaire capable de surveiller d'un seul regard les mouvements de troupes entre le bassin rhodanien et le bassin ligérien. »"
    ],
    inStock: 22,
    featured: true,
    coverBgColor: '#1E2D3D', // Deep Navy
    coverAccentColor: '#E6C687',
    motif: 'fortress',
    amazonUrl: 'https://www.amazon.fr/dp/2950729509/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 3. HISTOIRE DE BIBRACTE - TOME 3 : L'ÉPÉE FLAMBOYANTE
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
    dimensions: '15 × 21 cm, broché avec illustrations et schémas d’armes',
    weightGrams: 430,
    price: 22.0,
    priceEbook: 9.9,
    priceCombo: 26.0,
    category: 'Histoire de Bibracte',
    shortDescription:
      "L'épopée militaire et la métallurgie sacrée des forgerons gaulois. Le rôle des armes éduennes et la diplomatie armée de Dumnorix.",
    fullSynopsis: [
      "Le tome 3 de l'Histoire de Bibracte explore le rôle militaire, technique et spirituel de l'armement gaulois à l'époque de la conquête romaine.",
      "Les Éduens possédaient une renommée inégalée pour l'artisanat du fer et du bronze. À travers 'L'Épée Flamboyante', Émile Mourey analyse la symbolique guerrière des épées longues celtiques à deux tranchants et le rituel sacré de consécration des armes aux dieux du panthéon gaulois.",
      "L'ouvrage lève également le voile sur la figure tragique de Dumnorix l'Éduen, frère du druide Diviciacos : chef de la cavalerie, patriote indomptable refusant l'hégémonie césarienne, il mena la résistance nationale jusqu'à son assassinat sur ordre de César en 54 av. J.-C."
    ],
    tableOfContents: [
      'Chapitre 1 : Les maîtres de la forge et du minerai en Saône-et-Loire',
      'Chapitre 2 : L’épée celtique longue face au glaive court romain : tactique de duel',
      'Chapitre 3 : Dumnorix le rebelle et l’escadron des mille cavaliers d’élite',
      'Chapitre 4 : Les sanctuaires d’armes consacrées et les sources d’eaux vives',
      'Chapitre 5 : Le drame de 52 av. J.-C. : l’ultime serment militaire de Bibracte'
    ],
    excerptTitle: 'Chapitre 2 : La métallurgie de guerre et la tactique éduenne',
    excerptPages: [
      "« L'épée flamboyante n'est pas une simple allégorie poétique : elle renvoie à la trempe particulière de l'acier gaulois forgé au cœur des fourneaux éduens. Dumnorix savait que l'indépendance de son peuple reposait sur la maîtrise de cette métallurgie d'élite. »",
      "« La cavalerie gauloise n'était pas une troupe désordonnée ; elle constituait une aristocratie d'armes redoutée de César, liée par des serments religieux indissolubles. »"
    ],
    keyQuotes: [
      "« Les forgerons de Bibracte maîtrisaient le corroyage du fer bien avant que les légions romaines ne découvrent la trempe des lames espagnoles. »",
      "« Dumnorix préféra mourir les armes à la main plutôt que d'embarquer comme otage vers la Bretagne insulaire avec les cohortes de César. »"
    ],
    inStock: 14,
    featured: false,
    coverBgColor: '#243D30', // Antique Forest Green
    coverAccentColor: '#DFBD74',
    motif: 'laurel',
    amazonUrl: 'https://www.decitre.fr/livres/histoire-de-bibracte-9782950729521.html',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 4. HISTOIRE DE BIBRACTE - TOME 4 : DIEU RAYONNANT
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
    excerptTitle: 'Chapitre 2 : La science astronomique des prêtres gaulois',
    excerptPages: [
      "« César lui-même concédait dans ses notes que les druides disputent longuement des astres et de leur mouvement, de la grandeur du monde et de la terre. Ce 'Dieu rayonnant' qui illuminait les sommets consacrés n'était autre que le principe régulateur des saisons agricoles et civiques. »",
      "« L'orientation des temples primitifs sur le Mont Saint-Vincent démontre que les bâtisseurs gaulois visaient avec une précision millimétrique l'azimut du lever solaire au solstice d'été. »"
    ],
    keyQuotes: [
      "« Le calendrier de Coligny prouve que les druides calculaient des cycles de soixante-deux mois lunaires avec une exactitude égale à celle des astronomes d'Alexandrie. »",
      "« Le culte solaire gaulois célébrait l'harmonie de l'homme avec les cycles cosmiques et la pérennité de l'âme immortelle. »"
    ],
    inStock: 18,
    featured: false,
    coverBgColor: '#5A2E1A', // Terracotta Gold
    coverAccentColor: '#F5C77E',
    motif: 'scroll',
    amazonUrl: 'https://www.amazon.fr/dp/2950729533/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 5. HISTOIRE DE BIBRACTE - TOME 5 : DIEU CACHÉ
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
      "Pourquoi les druides interdisaient-ils formellement de coucher par écrit leurs doctrines théologiques ? Comment la mémoire gauloise a-t-elle survécu aux interdictions des empereurs Auguste, Tibère et Claude ?",
      "Émile Mourey retrace le passage souterrain des symboles celtiques dans les cryptes romanes de Bourgogne, le culte des Vierges Noires et la toponymie des forêts profondes du pays de Charolles et d'Autun."
    ],
    tableOfContents: [
      'Chapitre 1 : Le tabou de l’écriture et la mémoire orale millénaire',
      'Chapitre 2 : Les sanctuaires des eaux souterraines et des gouffres',
      'Chapitre 3 : La résistance spirituelle après Alésia et l’interdiction impériale romaine',
      'Chapitre 4 : La survivance du culte celtique dans les églises romanes bourguignonnes',
      'Synthèse générale : Le legs impérissable des Éduens pour l’Occident'
    ],
    excerptTitle: 'Chapitre 3 : La mémoire gauloise sous le voile de Rome',
    excerptPages: [
      "« Le Dieu caché, c'est cette présence persistante qui traverse les siècles sans que le conquistador ne puisse l'extirper. Lorsque les légions de Rome ont cru avoir écrasé la Gaule, celle-ci s'est réfugiée dans le silence de ses collines et la pérennité de ses rites ruraux. »",
      "« L'esprit des druides n'a pas péri dans les proscriptions impériales ; il s'est fondu dans la pierre des églises romanes bourguignonnes et dans la toponymie immémoriale de nos terroirs. »"
    ],
    keyQuotes: [
      "« Rome a pu détruire les remparts des oppida, mais elle n'a jamais pu effacer la mémoire des eaux sacrées et des chênes consacrés. »",
      "« Les bâtisseurs romans d'Autun, de Tournus et de Cluny ont réutilisé les alignements et les pierres des sanctuaires gaulois en pleine connaissance de cause. »"
    ],
    inStock: 15,
    featured: false,
    coverBgColor: '#25242C', // Dark Slate
    coverAccentColor: '#D97706',
    motif: 'shield',
    amazonUrl: 'https://www.amazon.fr/dp/2950729541/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 6. HISTOIRE DU CHRIST - TOME 1
  {
    id: 'mourey-christ-tome-1',
    title: 'Histoire du Christ',
    subtitle: 'Tome 1 : Enquête sur les origines et les sources antiques',
    tome: 'Tome 1',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 1996,
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
      "Une enquête historique minutieuse confrontant les évangiles aux historiens romains (Tacite, Suétone) et au droit impérial sous Ponce Pilate.",
    fullSynopsis: [
      "Émile Mourey applique sa rigueur méthodologique d'officier et de chercheur indépendant à l'un des plus grands mystères de l'histoire humaine : la vie et le contexte historique du Christ.",
      "En replaçant chaque récit évangélique dans l'administration provinciale romaine de Judée sous l'empereur Tibère et le préfet Ponce Pilate, l'auteur examine les textes avec le regard du juriste et du topographe.",
      "Ce tome 1 paru en juillet 1996 analyse les sources documentaires profanes (Tacite, Annales XV ; Suétone ; Flavius Josèphe), la géographie des déplacements en Galilée et à Jérusalem, les lois pénales romaines (lex Iulia de maiestate) et la confrontation politique avec le Sanhédrin sacerdotal."
    ],
    tableOfContents: [
      'Introduction : La quête de l’historicité rigoureuse du personnage du Christ',
      'Chapitre 1 : L’empire de Tibère et l’administration de la province romaine de Judée',
      'Chapitre 2 : La confrontation des sources : évangiles, Flavius Josèphe, Tacite et Suétone',
      'Chapitre 3 : Topographie des déplacements en Judée et réalités archéologiques',
      'Chapitre 4 : Le procès sous Ponce Pilate au regard du droit impérial romain',
      'Chapitre 5 : Les premiers cercles de témoins, les Esséniens et la transmission primitive'
    ],
    excerptTitle: 'Chapitre 4 : L’épreuve du prétoire romain et la lex Iulia',
    excerptPages: [
      "« Ponce Pilate n'était pas un philosophe en quête de vérité métaphysique, mais un procurateur impérial soucieux de l'ordre public de l'Empire. Pour comprendre le dénouement du procès, il faut scruter les règles impératives de la lex Iulia de maiestate... »",
      "« Aborder le Christ avec le regard de l'historien et du cartographe n'enlève rien au mystère ; cela le restitue dans sa chair terrestre, au cœur de la tourmente d'une province romaine sous Tibère. »"
    ],
    keyQuotes: [
      "« Le procès de Jésus ne peut être compris sans analyser les rivalités entre la noblesse sadducéenne du Temple et l'autorité militaire du préfet romain résidant à Césarée maritime. »",
      "« L'histoire authentique s'affranchit des hagiographies tardives pour interroger les faits matériels et les procédures juridiques de l'Antiquité. »"
    ],
    inStock: 19,
    featured: true,
    coverBgColor: '#3B1B2B', // Royal Plum
    coverAccentColor: '#E2B86E',
    motif: 'cross',
    amazonUrl: 'https://www.amazon.fr/dp/295072955X/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 7. HISTOIRE DU CHRIST - TOME 2
  {
    id: 'mourey-christ-tome-2',
    title: 'Histoire du Christ',
    subtitle: "Tome 2 : La diffusion et l'empreinte gallo-romaine",
    tome: 'Tome 2',
    author: 'Émile Mourey',
    publisher: 'Éditions Émile Mourey',
    publicationYear: 1996,
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
      "La pénétration des premières communautés chrétiennes dans l'Empire et l'éclosion des sanctuaires le long du Rhône et de la Saône en Bourgogne.",
    fullSynopsis: [
      "Dans le prolongement du premier tome, ce second volume paru en octobre 1996 explore la diffusion du message chrétien le long des voies de communication maritimes et fluviales de l'Empire vers la Gaule.",
      "Comment les marchands orientaux, les légionnaires et les premiers prédicateurs ont-ils remonté la vallée du Rhône et de la Saône jusqu'à Lyon, Autun et Chalon ?",
      "Émile Mourey étudie les premières épitaphes, les martyrs de Lyon en 177 sous Marc Aurèle (sainte Blandine, saint Pothin), la confrontation avec le paganisme gaulois et la métamorphose de l'Occident chrétien."
    ],
    tableOfContents: [
      'Chapitre 1 : Les routes maritimes et terrestres des premiers apôtres',
      'Chapitre 2 : L’axe rhodanien : de Massilia aux cités marchandes de Bourgogne',
      'Chapitre 3 : Les martyrs de Lyon de 177 et la mémoire éduenne',
      'Chapitre 4 : La conversion des élites sénatoriales gallo-romaines',
      'Épilogue : De la Gaule antique à la France médiévale'
    ],
    excerptTitle: 'Chapitre 2 : La remontée du couloir rhodanien et de la Saône',
    excerptPages: [
      "« C'est par les mêmes bateaux de bateliers qui transportaient l'huile et les amphores méditerranéennes que la nouvelle foi a gagné les quais d'Autun et les collines de Saône-et-Loire. L'histoire du christianisme occidental s'est écrite sur nos fleuves. »",
      "« Le témoignage des martyrs de Lyon en 177 montre comment la cité des Éduens et celle des Ségusiaves ont accueilli une parole qui répondait à leur propre quête d'immortalité de l'âme, déjà enseignée par les druides. »"
    ],
    keyQuotes: [
      "« La foi nouvelle n'a pas détruit la culture gauloise ; elle est venue féconder une terre d'hommes libres préparée depuis des siècles à l'attente d'une transcendance. »",
      "« Les voies romaines d'Agrippa furent les vaisseaux sanguins par lesquels l'Évangile gagna le cœur de l'Europe occidentale. »"
    ],
    inStock: 17,
    featured: false,
    coverBgColor: '#34281E', // Dark Ochre
    coverAccentColor: '#DFBD74',
    motif: 'cross',
    amazonUrl: 'https://www.amazon.fr/dp/2950729568/',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 8. COFFRET INTÉGRALE HISTOIRE DE BIBRACTE (4 VOLUMES)
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
      "Livraison Colissimo offerte à domicile et dédicace calligraphiée personnalisée de l'auteur incluse sur simple demande."
    ],
    tableOfContents: [
      'Tome 2 : Le Bouclier Éduen (292 pages)',
      'Tome 3 : L’Épée Flamboyante (284 pages)',
      'Tome 4 : Dieu Rayonnant (310 pages)',
      'Tome 5 : Dieu Caché (298 pages)',
      'Bonus : Carte grand format dépliante des oppida éduens en Saône-et-Loire'
    ],
    excerptTitle: 'Note éditoriale sur l’Intégrale Bibracte',
    excerptPages: [
      "« Rassembler ces quatre volets, c'est offrir aux amoureux d'histoire et de patrimoine la vision complète de ce que fut la plus puissante république de la Gaule centrale. »"
    ],
    keyQuotes: [
      "« Quatre volumes pour restituer aux Éduens la place prépondérante qu'ils occupaient avant que César ne franchisse le Rubicon. »"
    ],
    inStock: 9,
    featured: true,
    coverBgColor: '#2F1810',
    coverAccentColor: '#F59E0B',
    motif: 'fortress',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 9. DUO HISTOIRE DU CHRIST (2 TOMES)
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
    excerptTitle: 'Présentation du diptyque historique',
    excerptPages: [
      "« Ce diptyque permet d'appréhender le passage de l'événement antique judéen à l'épanouissement de la première chrétienté gallo-romaine. »"
    ],
    keyQuotes: [
      "« De la Judée de Ponce Pilate aux berges de la Saône, une même quête historique de vérité factuelle. »"
    ],
    inStock: 11,
    featured: true,
    coverBgColor: '#281525',
    coverAccentColor: '#E6C687',
    motif: 'cross',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 10. HISTOIRE DE MAHOMET - TOME 1 (INÉDIT / SANS ISBN / HORS VENTE)
  {
    id: 'mourey-mahomet-tome-1',
    title: 'Histoire de Mahomet',
    subtitle: "Tome 1 : Les Origines, La Mecque et la Prédication d'après la Chronique de Tabari",
    tome: 'Tome 1',
    author: 'Émile Mourey',
    publisher: 'Manuscrit d’Auteur (Édition patrimoniale)',
    publicationYear: 2006,
    pages: 320,
    isbn: 'Sans ISBN (Hors commerce)',
    dimensions: 'Manuscrit in-octavo (Diffusion PDF à venir)',
    weightGrams: 0,
    price: 0,
    priceEbook: 0,
    category: 'Histoire de Mahomet',
    isUnpublished: true,
    availabilityNotice:
      "Ouvrage inédit d'Émile Mourey n'ayant pas fait l'objet d'un dépôt légal officiel (aucun numéro ISBN attribué). Cet ouvrage ne peut pas être mis à la vente. Il sera consultable prochainement sous forme de document PDF téléchargeable (ou via un service en ligne d'impression à la demande en cours de définition).",
    shortDescription:
      "Une enquête historique rigoureuse confrontant la Chronique universelle de Tabari aux réalités géographiques, tribales et religieuses de l'Arabie préislamique.",
    fullSynopsis: [
      "Dans ce premier volet de son enquête sur les origines de l'islam, Émile Mourey applique sa méthode critique d'officier et de chercheur indépendant à la figure historique de Mahomet.",
      "S'appuyant sur la source historiographique musulmane la plus ancienne et la plus monumentale — la Chronique universelle de Tabari (Ta'rīkh al-Rusul wa al-Mulūk) —, l'auteur retrace les origines du clan hachémite au sein de la puissante tribu marchande des Quraychites.",
      "L'ouvrage analyse le contexte du paganisme arabe, les influences judéo-chrétiennes et esséniennes du Hedjaz, l'expérience mystique du mont Hira et la prédication primitive à La Mecque. Émile Mourey s'attache à dépouiller le récit des extrapolations partisanes pour faire ressortir l'authenticité humaine, politique et spirituelle du Prophète.",
      "L'auteur rappelle que pour comprendre religions et civilisations, il faut en dégager les ressorts historiques véritables, loin de l'obscurantisme et du fanatisme contemporain."
    ],
    tableOfContents: [
      'Introduction : Pour une approche historique et rationnelle des origines de l’islam',
      'Chapitre 1 : L’Arabie au VIe siècle : entre Empire byzantin chrétien et Empire sassanide',
      'Chapitre 2 : La Mecque marchande, la Ka’ba et le clan des Banu Hachim',
      'Chapitre 3 : La jeunesse de Mahomet, le mariage avec Khadija et les caravanes de Syrie',
      'Chapitre 4 : La retraite du mont Hira et les premières révélations selon la Chronique de Tabari',
      'Chapitre 5 : La prédication mecquoise : appel à l’Unicité divine et fracture tribale',
      'Chapitre 6 : Les persécutions quraychites, l’exil d’Abyssinie et l’année de la tristesse',
      'Épilogue du Tome 1 : L’impasse mecquoise et l’appel des tribus de Yathrib'
    ],
    excerptTitle: 'Chapitre 4 : La vision du mont Hira selon la Chronique de Tabari',
    excerptPages: [
      "« Pour comprendre Mahomet, l'historien doit écarter les jugements partisans et revenir à la lettre des chroniques premières. Tabari nous décrit un homme tourmenté par la décadence des mœurs de sa cité et en quête passionnée du Dieu unique. Lorsqu'il s'isole dans la grotte de Hira, ce n'est pas un chef de guerre qui s'exprime, mais un veilleur solitaire bouleversé par la voix qui lui intime : 'Lis !' (Iqra). »",
      "« La source tabarienne montre avec une franchise remarquable les hésitations, les doutes et le déchirement intime de Mahomet face à l'immensité de la mission qui lui incombe. C'est cette dimension humaine et historique que nous avons voulu restituer. »"
    ],
    keyQuotes: [
      "« L'histoire ne grandit les religions qu'en cherchant la vérité de leurs origines terrestres, loin de l'obscurantisme et des anachronismes. »",
      "« En lisant Tabari mot à mot, on découvre un Mahomet profondément inséré dans les luttes économiques et claniques de La Mecque, dont le premier combat fut la dignité des orphelins et le refus de l'idolâtrie lucrative. »"
    ],
    inStock: 0,
    featured: false,
    coverBgColor: '#0F2E22', // Islamic Emerald Green
    coverAccentColor: '#E6C687',
    motif: 'moon',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 11. HISTOIRE DE MAHOMET - TOME 2 (INÉDIT / SANS ISBN / HORS VENTE)
  {
    id: 'mourey-mahomet-tome-2',
    title: 'Histoire de Mahomet',
    subtitle: "Tome 2 : Médine, les Traités, l'Hégire et l'Épreuve du Pouvoir d'après la Chronique de Tabari",
    tome: 'Tome 2',
    author: 'Émile Mourey',
    publisher: 'Manuscrit d’Auteur (Édition patrimoniale)',
    publicationYear: 2008,
    pages: 340,
    isbn: 'Sans ISBN (Hors commerce)',
    dimensions: 'Manuscrit in-octavo (Diffusion PDF à venir)',
    weightGrams: 0,
    price: 0,
    priceEbook: 0,
    category: 'Histoire de Mahomet',
    isUnpublished: true,
    availabilityNotice:
      "Ouvrage inédit d'Émile Mourey n'ayant pas fait l'objet d'un dépôt légal officiel (aucun numéro ISBN attribué). Non mis à la vente. Ce livre sera consultable prochainement sous forme de document PDF téléchargeable (ou via un service d'impression à la demande en cours de mise en place).",
    shortDescription:
      "De l'Hégire (622) aux derniers adieux : l'édification de l'État médinois, la diplomatie des traités et les campagnes militaires analysées d'après Tabari.",
    fullSynopsis: [
      "Le second tome de l'Histoire de Mahomet aborde la phase décisive de la fondation institutionnelle, juridique et militaire : l'installation à Médine (Yathrib) après l'Hégire en 622.",
      "Émile Mourey étudie la Charte de Médine, texte d'une modernité politique saisissante qui unifiait croyants, musulmans et tribus juives sous un même pacte civique de protection mutuelle.",
      "L'ouvrage examine les grandes confrontations militaires décrites avec précision par Tabari (batailles de Badr, d'Uhud, siège du Fossé), l'évolution de la législation coranique, le chef-d'œuvre diplomatique du traité d'al-Hudaybiyya, puis la prise pacifique de La Mecque en 630. Une synthèse impartiale et rigoureuse sur la genèse d'un empire."
    ],
    tableOfContents: [
      'Chapitre 1 : L’Hégire (622) : rupture chronologique et fondation de l’Umma',
      'Chapitre 2 : La Charte de Médine : diplomatie, citoyenneté et pluralisme religieux',
      'Chapitre 3 : Les premières campagnes militaires selon Tabari : de Badr à Uhud',
      'Chapitre 4 : Le siège de la Tranchée et les ruptures d’alliances tribales',
      'Chapitre 5 : Le pacte d’al-Hudaybiyya : la victoire politique de la négociation',
      'Chapitre 6 : L’entrée victorieuse à La Mecque et la purification des idoles de la Ka’ba',
      'Chapitre 7 : Le pèlerinage d’Adieu et la mort du Prophète (632)',
      'Épilogue : Bilan historique de l’héritage arabo-musulman'
    ],
    excerptTitle: 'Chapitre 2 : La Charte de Médine selon les Annales de Tabari',
    excerptPages: [
      "« À Médine, Mahomet change d'échelle : de prédicateur persécuté, il devient législateur et arbitre suprême. La convention établie entre les Émigrés, les Auxiliaires et les clans de Médine démontre un génie politique consommé, soucieux de substituer la solidarité civique à la vendetta de sang. »",
      "« Relire les campagnes de Badr et d'Uhud avec les yeux d'un officier permet de mesurer combien chaque manœuvre répondait à des impératifs d'approvisionnement des puits et de protection des défilés rocheux. Tabari ne dissimule rien des vicissitudes de ces engagements. »"
    ],
    keyQuotes: [
      "« L'Hégire n'est pas seulement un départ, c'est l'acte de naissance d'un nouveau modèle sociétal où la loi morale s'incarne dans les nécessités d'un gouvernement temporel. »",
      "« Le pardon général accordé aux Quraychites lors de l'entrée à La Mecque en 630 constitue le sommet de la vision politique de Mahomet, préférant l'intégration des élites vaincues à la vengeance tribale. »"
    ],
    inStock: 0,
    featured: false,
    coverBgColor: '#132B3B', // Deep Sapphire Blue
    coverAccentColor: '#E2B86E',
    motif: 'moon',
    digitalPdfUrl: GOOGLE_DRIVE_PDF_FOLDER
  },

  // 12. LA GAULE EN HÉRITAGE (MANUSCRIT INÉDIT / SANS ISBN / HORS VENTE)
  {
    id: 'mourey-gaule-en-heritage',
    title: 'La Gaule en héritage',
    subtitle: 'Le génie des cités celtiques, les vérités de terrain et la transmission gallo-romaine',
    author: 'Émile Mourey',
    publisher: 'Manuscrit Inédit de Recherche Historique',
    publicationYear: 2018,
    pages: 280,
    isbn: 'Sans ISBN (Hors commerce)',
    dimensions: 'Manuscrit in-octavo (Diffusion PDF à venir)',
    weightGrams: 0,
    price: 0,
    priceEbook: 0,
    category: 'Manuscrits Inédits',
    isUnpublished: true,
    availabilityNotice:
      "Manuscrit inédit d'Émile Mourey non soumis à dépôt légal (aucun numéro ISBN attribué). Hors commerce. Cet ouvrage ne peut pas être mis à la vente. Il sera consultable prochainement sous forme de document PDF téléchargeable (ou via un service en ligne d'impression à la demande en cours de définition).",
    shortDescription:
      "Le grand testament intellectuel d'Émile Mourey : synthèse de 25 années de recherches sur l'identité souveraine de la Gaule, ses oppida véritables et son héritage impérissable.",
    fullSynopsis: [
      "Fruit de plus d'un quart de siècle d'enquêtes cartographiques, géologiques et textuelles, 'La Gaule en héritage' constitue la somme historique et le testament intellectuel d'Émile Mourey.",
      "L'auteur y condense ses découvertes capitales : la véritable localisation de Bibracte au Mont Saint-Vincent, celle de Gergovie au Crest, et la relecture lucide de la Guerre des Gaules débarrassée des dogmes académiques forgés au XIXe siècle sous Napoléon III.",
      "Mais au-delà des querelles de sites, ce manuscrit explore la civilisation gauloise dans sa dimension la plus noble : le réseau confédéral des soixante cités autonomes, la métallurgie et l'agriculture de pointe, la souveraineté républicaine éduenne, et la résistance civique qui survécut à la romanisation, depuis les révoltes des Bagaudes jusqu'à l'Empire des Gaules au IIIe siècle avec Postumus, Tetricus et la noble Victorina.",
      "Un vibrant plaidoyer pour la réhabilitation du patrimoine authentique de la Gaule et de la Bourgogne."
    ],
    tableOfContents: [
      'Introduction : Vingt-cinq années de combat pour la vérité du sol',
      'Chapitre 1 : Les erreurs fondamentales de l’archéologie officielle du Second Empire',
      'Chapitre 2 : La confédération des cités gauloises : souveraineté et libertés locales',
      'Chapitre 3 : La géographie sacrée : du Mont Saint-Vincent aux rives de la Saône',
      'Chapitre 4 : La Guerre des Gaules au crible de la tactique d’infanterie',
      'Chapitre 5 : L’Empire des Gaules au IIIe siècle : Victorina et le refus de la décadence romaine',
      'Chapitre 6 : La survie de l’héritage celtique dans l’art roman de Bourgogne',
      'Épilogue : Ce que la France et l’Europe doivent à leurs ancêtres gaulois'
    ],
    excerptTitle: 'Extrait de l’Introduction : Le devoir de vérité pour la Gaule',
    excerptPages: [
      "« On a trop longtemps dépeint nos ancêtres gaulois comme des barbares chevelus terrés dans des huttes de branchages, attendant que le génie de Rome vienne leur apporter la civilisation. Les textes antiques et la géométrie de nos terroirs racontent exactement l'inverse : la Gaule possédait des métropoles florissantes, un réseau routier perfectionné, un artisanat envié de tout le bassin méditerranéen et une spiritualité cosmique dont les druides étaient les dépositaires vigilants. »",
      "« Écrire l'histoire avec les pieds et la boussole, c'est arpenter chaque crête, mesurer chaque fossé, vérifier si les centurions pouvaient physiquement gravir la pente en armure. C'est ce travail d'une vie que ce manuscrit livre aux générations futures. »"
    ],
    keyQuotes: [
      "« La Gaule n'a pas été conquise parce qu'elle était primitive, mais parce qu'elle s'est déchirée entre cités rivales face au machiavélisme d'un conquérant sans scrupules. »",
      "« Retrouver les véritables oppida d'Émile Mourey, ce n'est pas seulement corriger des cartes postales : c'est rendre au peuple de Bourgogne et de France la fierté de ses racines millénaires. »"
    ],
    inStock: 0,
    featured: false,
    coverBgColor: '#3A192B', // Imperial Roman Purple / Amaranth
    coverAccentColor: '#DFBD74',
    motif: 'laurel',
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
  role: 'Historien, Ancien officier de Saint-Cyr & Chercheur indépendant',
  decorations: 'Chevalier de la Légion d’Honneur, Officier de l’Ordre National du Mérite',
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

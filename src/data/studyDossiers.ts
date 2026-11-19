export type DossierDomain =
  | 'Gaule & Guerre des Gaules'
  | 'Art roman & Judéo-druidisme'
  | 'Textes sacrés & Philosophie';

export interface StudyDossier {
  id: string;
  slug: string;
  number: string;
  domain: DossierDomain;
  title: string;
  subtitle: string;
  lead: string;
  moureyPoints: string[];
  academicCounterpointTitle: string;
  academicCounterpoint: string;
  keySources: string[];
  relatedBookIds: string[];
  agoravoxUrl: string;
  agoravoxLabel: string;
}

/**
 * Dossiers d'études thématiques reliant les ouvrages des Éditions Émile Mourey,
 * les 563 articles publiés sur AgoraVox et la synthèse éditoriale de la collection.
 */
export const STUDY_DOSSIERS: StudyDossier[] = [
  {
    id: 'dossier-alesia',
    slug: 'alesia-guerre-des-gaules',
    number: '01',
    domain: 'Gaule & Guerre des Gaules',
    title: 'Alésia : chronologie de marche et montagne de Bussy',
    subtitle: 'Retraduction de César (altero die) et analyse tactique du siège',
    lead:
      "En appliquant le regard d'un officier saint-cyrien au livre VII du De Bello Gallico, Émile Mourey réexamine les distances de marche, la localisation de la bataille de cavalerie préliminaire et l'assaut final de l'armée de secours.",
    moureyPoints: [
      "Critique de la traduction de Constans : l'expression latine altero die (« le surlendemain ») décale la bataille de cavalerie d'environ 50 km, vers Noyers-sur-Serein.",
      "Réévaluation de l'assaut de Vercassivellaunos : la logique des lignes de crête et des angles d'attaque déplace le point critique vers la montagne de Bussy plutôt que le mont Rhéa.",
      "Relecture critique des fouilles franco-allemandes engagées en 1992 à Alise-Sainte-Reine au regard du texte latin littéral."
    ],
    academicCounterpointTitle: 'Consensus archéologique (Alise-Sainte-Reine)',
    academicCounterpoint:
      "Les fouilles menées depuis le XIXe siècle puis reprises par l'équipe franco-allemande dans les années 1990 ont dégagé autour du mont Auxois un double réseau de fossés, des armes romaines et gauloises et un abondant monnayage attribué au siège de 52 av. J.-C. Les archéologues rappellent que subordonner les fouilles aux textes expose au biais de confirmation.",
    keySources: [
      'Jules César, De Bello Gallico (Livre VII)',
      'Fouilles franco-allemandes d’Alésia (1992)',
      'Relevés topographiques de Côte-d’Or et de l’Yonne'
    ],
    relatedBookIds: ['mourey-gaule-en-heritage', 'mourey-gergovie-tome-1'],
    agoravoxUrl: 'https://www.agoravox.fr/auteur/emile-mourey',
    agoravoxLabel: 'Articles Alésia sur AgoraVox'
  },
  {
    id: 'dossier-bibracte',
    slug: 'bibracte-mont-saint-vincent',
    number: '02',
    domain: 'Gaule & Guerre des Gaules',
    title: 'Bibracte au Mont-Saint-Vincent & Gorgobina au mont Beuvray',
    subtitle: 'Itinere converso, bataille des Helvètes à Sanvignes et Table de Peutinger',
    lead:
      "Au cœur de la tétralogie d'Émile Mourey, la capitale des Éduens quitte le massif isolé du Morvan pour retrouver le nœud routier et stratégique du Mont-Saint-Vincent en Saône-et-Loire.",
    moureyPoints: [
      "L'expression itinere converso (Livre I) et les distances de la Table de Peutinger — lue comme carte stratégique et symbolique de l'Empire — convergent vers le Mont-Saint-Vincent.",
      "La bataille des Helvètes (58 av. J.-C.) est replacée dans le bassin de Sanvignes, où la topographie explique la manœuvre romaine en triple ligne et le repli gaulois.",
      "Dans cette cohérence militaire, le mont Beuvray correspond à Gorgobina, place-forte confiée aux Boïens sur la marche occidentale du territoire éduen ; discussion du bilan CNRS Gallia 55 (1998)."
    ],
    academicCounterpointTitle: 'Position du Centre archéologique européen de Bibracte',
    academicCounterpoint:
      "L'archéologie institutionnelle identifie fermement Bibracte au mont Beuvray grâce à l'ampleur de ses remparts (murus gallicus), de ses quartiers artisanaux, de ses voies dallées et de son faciès monétaire éduen documenté par des décennies de fouilles publiées dans Gallia.",
    keySources: [
      'Jules César, De Bello Gallico (Livre I)',
      'Table de Peutinger',
      'Bilan CNRS Gallia, tome 55 (1998)'
    ],
    relatedBookIds: [
      'mourey-bibracte-tome-2-bouclier-eduen',
      'mourey-bibracte-tome-3-epee-flamboyante',
      'mourey-coffret-integrale-bibracte'
    ],
    agoravoxUrl: 'https://www.agoravox.fr/auteur/emile-mourey',
    agoravoxLabel: 'Articles Bibracte sur AgoraVox'
  },
  {
    id: 'dossier-gergovie',
    slug: 'gergovie-le-crest',
    number: '03',
    domain: 'Gaule & Guerre des Gaules',
    title: 'Gergovie au Crest : contre-enquête sur le « faux plateau »',
    subtitle: 'Camps de César, élévations et manœuvre de diversion de Vercingétorix',
    lead:
      "Premier volet du cycle gaulois, l'enquête sur Gergovie conteste l'identification officielle de Merdogne héritée du Second Empire et propose une reconstitution tactique complète autour du Crest.",
    moureyPoints: [
      "Remise en cause des conclusions archéologiques du XIXe siècle sous Napoléon III, qualifiant le plateau officiel de Merdogne de « faux plateau » incompatible avec les mouvements décrits.",
      "Vérification des hauteurs relatives entre le grand camp et le petit camp romains, ainsi que du couloir permettant la manœuvre de diversion de la cavalerie arverne.",
      "Proposition de localisation au Crest (Auvergne), articulant pentes, visibilité et voies de repli des légions."
    ],
    academicCounterpointTitle: 'Consensus universitaire (Plateau de Gergovie / Merdogne)',
    academicCounterpoint:
      "Les fouilles contemporaines sur le plateau de Gergovie-Merdogne et ses abords (camps d'Orcet et de La Roche-Blanche, double fossé reliant les deux camps) confortent l'identification traditionnelle. Des contributeurs spécialisés critiquent en outre l'accumulation d'hypothèses spectaculaires autour du Crest sans stratigraphie probante.",
    keySources: [
      'Jules César, De Bello Gallico (Livre VII, 36–53)',
      'Cartes IGN d’Auvergne (secteur du Crest et de Merdogne)',
      'Travaux topographiques sur les camps romains'
    ],
    relatedBookIds: ['mourey-gergovie-tome-1', 'mourey-gaule-en-heritage'],
    agoravoxUrl: 'https://www.agoravox.fr/auteur/emile-mourey',
    agoravoxLabel: 'Articles Gergovie sur AgoraVox'
  },
  {
    id: 'dossier-judeo-druidisme',
    slug: 'judeo-druidisme-art-roman',
    number: '04',
    domain: 'Art roman & Judéo-druidisme',
    title: 'Judéo-druidisme et message caché de l’art roman bourguignon',
    subtitle: 'Cathédrale de Chalon-sur-Saône, Autun et tympan de Vézelay',
    lead:
      "Dans les tomes 4 et 5 d'Histoire de Bibracte et ses chroniques iconographiques, Émile Mourey soutient l'existence d'une continuité spirituelle entre le monde celtique, le judaïsme messianique et la sculpture romane de Bourgogne.",
    moureyPoints: [
      "Thèse de la continuité spirituelle : loin d'une rupture brutale avec un paganisme barbare, « le druidisme s'est révélé dans son évolution judaïque » autour du foyer éduen.",
      "Relecture de la pierre sculptée : dans l'ancienne cathédrale Saint-Vincent de Chalon-sur-Saône, un chapiteau du chœur porterait « le signe de reconnaissance des textes esséniens ».",
      "Interprétation du tympan de Vézelay et des sculptures d'Autun comme le témoignage d'une alliance entre la philosophie de l'empereur Julien et un judaïsme messianique évangélique."
    ],
    academicCounterpointTitle: 'Lecture de l’histoire de l’art médiéval',
    academicCounterpoint:
      "Les médiévistes et historiens de l'art inscrivent les programmes sculptés de Vézelay, d'Autun et de Chalon-sur-Saône dans la théologie monastique bénédictine et clunisienne des XIe–XIIe siècles (Pentecôte, Jugement dernier, typologie biblique), sans filiation documentée avec le druidisme antique ou l'essénisme.",
    keySources: [
      'Chapiteaux de la cathédrale Saint-Vincent de Chalon-sur-Saône',
      'Tympan de la basilique Sainte-Marie-Madeleine de Vézelay',
      'Sculptures romanes d’Autun & manuscrits esséniens'
    ],
    relatedBookIds: [
      'mourey-bibracte-tome-4-dieu-rayonnant',
      'mourey-bibracte-tome-5-dieu-cache',
      'mourey-christ-tome-2'
    ],
    agoravoxUrl: 'https://www.agoravox.fr/auteur/emile-mourey',
    agoravoxLabel: 'Articles Art roman & Judéo-druidisme sur AgoraVox'
  },
  {
    id: 'dossier-christ',
    slug: 'histoire-du-christ-sources',
    number: '05',
    domain: 'Textes sacrés & Philosophie',
    title: 'Histoire du Christ : droit romain, essénisme et routes de Gaule',
    subtitle: 'Enquête croisée sur les sources évangéliques et la diffusion fluviale',
    lead:
      "En deux tomes, l'auteur soumet les récits évangéliques à la même grille d'analyse historique que les campagnes de César : procédures juridiques romaines, contexte politique de Judée et circulation des idées vers la Gaule.",
    moureyPoints: [
      "Confrontation des récits de la Passion au droit pénal romain en vigueur sous Ponce Pilate et aux tensions entre courants religieux du Ier siècle.",
      "Mise en lumière de la matrice essénienne et judéo-chrétienne dans la formation des premiers textes.",
      "Suivi de la diffusion des communautés judéo-chrétiennes le long des axes fluviaux (Rhône, Saône) jusqu'au cœur de la Bourgogne éduenne."
    ],
    academicCounterpointTitle: 'Exégèse historico-critique contemporaine',
    academicCounterpoint:
      "La recherche universitaire distingue les couches rédactionnelles des quatre Évangiles (rédigés entre 70 et 100 apr. J.-C.), souligne la complexité des rapports entre Jésus et le mouvement essénien de Qumrân, et date l'implantation attestée du christianisme en Gaule du IIe siècle (Lyon et Vienne).",
    keySources: [
      'Évangiles synoptiques et Évangile de Jean',
      'Flavius Josèphe, Antiquités judaïques',
      'Manuscrits de la mer Morte & droit pénal romain'
    ],
    relatedBookIds: [
      'mourey-christ-tome-1',
      'mourey-christ-tome-2',
      'mourey-duo-histoire-du-christ'
    ],
    agoravoxUrl: 'https://www.agoravox.fr/auteur/emile-mourey',
    agoravoxLabel: 'Articles Origines chrétiennes sur AgoraVox'
  },
  {
    id: 'dossier-mahomet',
    slug: 'mahomet-lecture-structurale',
    number: '06',
    domain: 'Textes sacrés & Philosophie',
    title: 'Histoire de Mahomet : lecture structurale et politico-militaire',
    subtitle: 'Décryptage comparé du Coran, de la Bible et des chroniques de Tabari',
    lead:
      "Dans ses deux tomes consacrés à Mahomet (manuscrits inédits consultables par extraits), Émile Mourey propose une lecture structurale audacieuse des origines de l'islam dans le prolongement de ses travaux sur le judéo-christianisme.",
    moureyPoints: [
      "Les grandes figures prophétiques (Abraham, Jésus, Mahomet) sont interprétées comme des désignations collectives de « conseils » directeurs ou sacerdotaux plutôt que de simples biographies individuelles.",
      "Les « épouses » mentionnées par la tradition (Khadidja, Aïscha) sont lues comme des symboles de « populations » alliées ou de « troupes militaires » structurant l'expansion.",
      "Les batailles fondatrices (Beder, Ohod, prise de La Mecque) sont décodées comme des manœuvres politico-militaires s'inscrivant dans la continuité de l'essénisme et du judéo-christianisme."
    ],
    academicCounterpointTitle: 'Islamologie historique et philologie',
    academicCounterpoint:
      "L'islamologie universitaire, bien qu'elle examine avec distance critique les sources tardives comme Tabari (IXe–Xe siècles), inscrit la naissance de l'islam dans le contexte historique et linguistique de l'Arabie du VIIe siècle et ne valide pas la réduction systématique des personnages à des allégories institutionnelles ou militaires.",
    keySources: [
      'Texte coranique et récits bibliques comparés',
      'Chroniques de Tabari',
      'Manuscrits inédits Histoire de Mahomet (Tomes 1 & 2)'
    ],
    relatedBookIds: ['mourey-mahomet-tome-1', 'mourey-mahomet-tome-2'],
    agoravoxUrl: 'https://www.agoravox.fr/auteur/emile-mourey',
    agoravoxLabel: 'Articles Religions & Sources sur AgoraVox'
  },
  {
    id: 'dossier-metaphysique-agoravox',
    slug: 'metaphysique-et-agoravox',
    number: '07',
    domain: 'Textes sacrés & Philosophie',
    title: 'Quête métaphysique et 20 ans de débats sur AgoraVox',
    subtitle: '« Qu’est-ce que l’homme ? », 563 articles publiés et patrimoine du Château de Taisey',
    lead:
      "Au-delà de la topographie antique, l'œuvre d'Émile Mourey porte une interrogation philosophique constante face au matérialisme moderne, nourrie par vingt années de publication citoyenne sur AgoraVox.",
    moureyPoints: [
      "Une réflexion métaphysique (« Qu'est-ce que l'homme ? ») dialoguant de façon critique avec l'humanisme matérialiste contemporain (Luc Ferry, André Comte-Sponville) en faveur d'une évolution spirituelle guidée par « Ce qui nous dépasse ».",
      "Un corpus exceptionnel de 563 articles publiés sur AgoraVox, lus par une communauté fidèle et débattus pied à pied par l'auteur.",
      "Un engagement personnel pour la mémoire historique bourguignonne et le Château de Taisey, prolongé aujourd'hui par un tirage papier de collection limité et l'édition numérique Kindle."
    ],
    academicCounterpointTitle: 'Réception critique et pluralisme des lectures',
    academicCounterpoint:
      "La réception publique sur AgoraVox reflète une forte polarisation : d'un côté des lecteurs fidèles saluant la ténacité, la clarté pédagogique tactique et le refus des dogmes ; de l'autre des contradicteurs sceptiques qui contestent la méthode et défendent l'archéologie académique ou le rationalisme matérialiste.",
    keySources: [
      '563 articles publiés sur AgoraVox (emile-mourey)',
      'La Gaule en héritage (Parties 1 & 2)',
      'Échanges publics avec les lecteurs commentateurs'
    ],
    relatedBookIds: ['mourey-gaule-en-heritage', 'mourey-coffret-integrale-bibracte'],
    agoravoxUrl: 'https://www.agoravox.fr/auteur/emile-mourey',
    agoravoxLabel: 'Parcourir les 563 articles sur AgoraVox'
  }
];

export type DossierDomain =
  | 'Gaule & Guerre des Gaules'
  | 'Art roman & Judéo-druidisme'
  | 'Textes sacrés & Philosophie';

export interface DossierSourceRef {
  label: string;
  url?: string;
  institution?: string;
  kind?: 'antique' | 'scientific' | 'archive' | 'book';
}

export interface DossierBookExcerpt {
  bookId: string;
  bookTitle: string;
  tome?: string;
  page: string;
  heading: string;
  quote: string;
}

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
  keySources: DossierSourceRef[];
  bookExcerpts: DossierBookExcerpt[];
  relatedBookIds: string[];
  agoravoxUrl: string;
  agoravoxLabel: string;
}

/**
 * Dossiers d'études thématiques reliant les ouvrages des Éditions Émile Mourey,
 * les 559 articles publiés sur AgoraVox, les extraits littéraux des livres (D1)
 * et les sources scientifiques / universitaires officielles (CNRS, HAL-SHS, Persée, INRAP).
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
      "Réévaluation de l'assaut de Vercassivellaunos : la logique des lignes de crête et des angles d'attaque déplace le point critique vers la montagne de Bussy (422 m) plutôt que le mont Rhéa.",
      "Relecture critique des fouilles franco-allemandes engagées en 1992 à Alise-Sainte-Reine et des relevés du commandant Stoffel au regard du texte latin littéral."
    ],
    academicCounterpointTitle: 'Consensus archéologique (Alise-Sainte-Reine)',
    academicCounterpoint:
      "Les fouilles menées depuis le XIXe siècle puis reprises par la mission franco-allemande (Michel Reddé, Siegmar von Schnurbein, 1991–1997) ont dégagé autour du mont Auxois un double réseau de fossés de circonvallation et contrevallation, des balles de fronde au nom de Labiénus, des monnaies de 52 av. J.-C. et l'inscription IN ALISIIA. Les archéologues rappellent que subordonner les fouilles aux textes expose au biais de confirmation.",
    keySources: [
      {
        label: 'Jules César, De Bello Gallico (Livre VII, 66–89)',
        url: 'https://remacle.org/bloodwolf/historiens/cesar/guerre7.htm',
        institution: 'Texte latin & traduction (L.-A. Constans)',
        kind: 'antique'
      },
      {
        label: 'M. Reddé & S. von Schnurbein — Fouilles franco-allemandes d’Alésia (CRAI, 1995)',
        url: 'https://www.persee.fr/doc/crai_0065-0536_1995_num_139_1_15460',
        institution: 'Persée / Académie des Inscriptions et Belles-Lettres',
        kind: 'scientific'
      },
      {
        label: 'Publications CNRS / HAL-SHS sur Alésia & Alise-Sainte-Reine',
        url: 'https://hal.science/search/index/?q=Alesia+Alise-Sainte-Reine',
        institution: 'CNRS HAL-SHS',
        kind: 'scientific'
      }
    ],
    bookExcerpts: [
      {
        bookId: 'mourey-bibracte-tome-2-bouclier-eduen',
        bookTitle: 'Histoire de Bibracte',
        tome: 'Tome 2 : Le Bouclier Éduen',
        page: 'p. 197',
        heading: 'L’attaque sur le plateau de Bussy et les relevés de Stoffel',
        quote:
          "« On peut se demander si le Commandant Stoffel, pour ne pas contredire Napoléon III, n'a pas volontairement laissé dans le flou le véritable tracé de l'enceinte extérieure à cet endroit. La thèse que nous soutenons est une attaque sur le plateau de Bussy. La montagne est étendue. Son sommet qui culmine à 422 mètres est en effet trop éloigné pour avoir pu être inclus dans le dispositif romain. »"
      },
      {
        bookId: 'mourey-bibracte-tome-2-bouclier-eduen',
        bookTitle: 'Histoire de Bibracte',
        tome: 'Tome 2 : Le Bouclier Éduen',
        page: 'p. 199',
        heading: 'Engagement des réserves et manœuvre de César vers Bussy',
        quote:
          "« Il est probable que vers la fin des combats, l'armée romaine a été engagée dans sa presque totalité, au pied du Mont-Rhéa contre Vercingétorix, sur la montagne de Bussy contre Vercassivellaunos, et dans la plaine des Laumes contre le reste de l'armée de secours. Le génie de César, c'est la mobilité et l'art d'utiliser les réserves. »"
      }
    ],
    relatedBookIds: ['mourey-gaule-en-heritage', 'mourey-bibracte-tome-2-bouclier-eduen', 'mourey-gergovie-tome-1'],
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
      "L'expression itinere converso (Livre I) et les distances de la Table de Peutinger — lue comme carte stratégique de l'Empire — convergent vers le Mont-Saint-Vincent.",
      "La bataille des Helvètes (58 av. J.-C.) est replacée dans le bassin de Sanvignes, où la topographie explique la manœuvre romaine en triple ligne et le repli gaulois.",
      "Dans cette cohérence militaire, le mont Beuvray correspond à Gorgobina, place-forte confiée aux Boïens sur la marche occidentale du territoire éduen ; discussion directe du bilan CNRS Gallia 55 (1998)."
    ],
    academicCounterpointTitle: 'Position du Centre archéologique européen de Bibracte',
    academicCounterpoint:
      "L'archéologie institutionnelle identifie fermement Bibracte au mont Beuvray (200 ha fortifiés) grâce à l'ampleur de ses remparts à murus gallicus (Porte du Rebout), ses ateliers métallurgiques, ses domus du Parc aux Chevaux, ses voies dallées et son faciès monétaire éduen documenté dans le bilan CNRS Gallia 55 (1998).",
    keySources: [
      {
        label: 'Jules César, De Bello Gallico (Livre I, 23–26)',
        url: 'https://remacle.org/bloodwolf/historiens/cesar/guerre1.htm',
        institution: 'Texte latin & traduction',
        kind: 'antique'
      },
      {
        label: 'Bilan CNRS — Revue Gallia, tome 55 (1998) : Les fouilles du mont Beuvray',
        url: 'https://www.persee.fr/issue/galia_0016-4119_1998_num_55_1',
        institution: 'Persée / CNRS Éditions',
        kind: 'scientific'
      },
      {
        label: 'Centre archéologique européen de Bibracte — Programme de recherche',
        url: 'https://www.bibracte.fr/la-recherche',
        institution: 'EPCC Bibracte / CNRS',
        kind: 'scientific'
      },
      {
        label: 'Table de Peutinger (OmnesViae — restitution interactive)',
        url: 'https://omnesviae.org/',
        institution: 'Itinéraire romain antique',
        kind: 'antique'
      }
    ],
    bookExcerpts: [
      {
        bookId: 'mourey-bibracte-tome-2-bouclier-eduen',
        bookTitle: 'Histoire de Bibracte',
        tome: 'Tome 2 : Le Bouclier Éduen',
        page: 'p. 106',
        heading: 'Le Mont-Beuvray, double stratégique du Mont-Saint-Vincent',
        quote:
          "« Le Mont-Beuvray ne fut pas Bibracte ; mais il faut cependant lui rendre justice : il fut un des plus importants oppidum de la cité éduenne. Sa masse énorme et imposante domine tout le pays éduen avec une telle force, qu'impressionnant les hommes de notre génération, elle impressionnait déjà nos ancêtres. Le Mont-Beuvray était le double du Mont-Saint-Vincent sur le plan de la stratégie territoriale. »"
      },
      {
        bookId: 'mourey-gaule-en-heritage',
        bookTitle: 'La Gaule en héritage',
        tome: '1ère partie',
        page: 'p. 61 & 63',
        heading: 'Gorgobina, site stratégique et dialogue avec le bilan Gallia 55',
        quote:
          "« Beuvray/Gorgobina, site stratégique, ne peut s’appliquer qu’à d’autres sites de ce type comme ceux qu’on trouve en Centre-Europe. Gorgobina, citée par César en tant qu’oppidum et non en tant que ville, est un site bien particulier qui a connu maintes tribulations : le passage des Germains d’Arioviste, l’installation en force d’une tribu boïenne. [...] Voici le texte de la lettre que j’ai adressée le 15/1/2003 à Madame Katherine Gruel, éditrice scientifique du bilan, au sujet des monnaies gauloises du mont Beuvray. »"
      }
    ],
    relatedBookIds: [
      'mourey-bibracte-tome-2-bouclier-eduen',
      'mourey-bibracte-tome-3-epee-flamboyante',
      'mourey-gaule-en-heritage',
      'mourey-coffret-integrale-bibracte'
    ],
    agoravoxUrl: 'https://www.agoravox.fr/actualites/article/bibracte-au-mont-beuvray-c-est-un-229299',
    agoravoxLabel: 'Article Bibracte / Beuvray sur AgoraVox'
  },
  {
    id: 'dossier-gergovie',
    slug: 'gergovie-le-crest',
    number: '03',
    domain: 'Gaule & Guerre des Gaules',
    title: 'Gergovie au Crest : contre-enquête sur le « faux plateau »',
    subtitle: 'Camps de César, élévations et manœuvre de diversion de Vercingétorix',
    lead:
      "Premier volet du cycle gaulois, l'enquête sur Gergovie conteste l'identification officielle de Merdogne héritée du Second Empire et propose une reconstitution tactique complète autour de l'éperon du Crest.",
    moureyPoints: [
      "Remise en cause des conclusions archéologiques du XIXe siècle sous Napoléon III, qualifiant le plateau officiel de Merdogne de « faux plateau » incompatible avec les mouvements décrits.",
      "Vérification des hauteurs relatives entre le grand camp et le petit camp romains, ainsi que du couloir permettant la manœuvre de diversion de la cavalerie arverne.",
      "Proposition de localisation sur l'éperon du Crest (Auvergne), articulant pentes, visibilité et voies de repli des légions."
    ],
    academicCounterpointTitle: 'Consensus universitaire (Plateau de Gergovie / Merdogne)',
    academicCounterpoint:
      "Les fouilles contemporaines INRAP / CNRS (Yann Deberge, Thomas Pertlwieser, Matthieu Poux) sur le plateau de Gergovie-Merdogne et ses abords (camps de la Serre d'Orcet et de La Roche-Blanche, double fossé reliant les deux camps, traits de catapulte et clous de caligae) confortent l'identification officielle. Les archéologues relèvent l'absence de stratigraphie probante d'un siège césarien au Crest.",
    keySources: [
      {
        label: 'Jules César, De Bello Gallico (Livre VII, 36–53)',
        url: 'https://remacle.org/bloodwolf/historiens/cesar/guerre7.htm',
        institution: 'Texte latin & traduction',
        kind: 'antique'
      },
      {
        label: 'Revue archéologique du Centre de la France (RACF) — Fouilles de Gergovie (INRAP / CNRS)',
        url: 'https://journals.openedition.org/racf/',
        institution: 'OpenEdition / CNRS / INRAP',
        kind: 'scientific'
      },
      {
        label: 'Publications CNRS HAL-SHS sur Gergovie, Corent & les Arvernes',
        url: 'https://hal.science/search/index/?q=Gergovie+Arvernes',
        institution: 'CNRS HAL-SHS',
        kind: 'scientific'
      }
    ],
    bookExcerpts: [
      {
        bookId: 'mourey-gergovie-tome-1',
        bookTitle: 'Histoire de Gergovie',
        tome: 'Tome 1',
        page: 'p. 34 & 42',
        heading: 'L’éperon du Crest et la symétrie des hauteurs environnantes',
        quote:
          "« Sur l'éperon du Crest, Gergovie te voici ! [...] Cette montagne semble être sortie tout droit des treize ou quatorze volcans qui forment à l'ouest un bien curieux groupe. Manifestement, il y a dans cet ensemble un ordre imposé par les dieux, depuis ces volcans terriblement menaçants jusqu'à l'éperon qui pointe vers le ciel. Les collines des alentours elles-mêmes semblent être disposées sur le terrain dans une symétrie voulue. »"
      }
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
      "Interprétation du tympan de Vézelay et des sculptures d'Autun comme le témoignage d'une tradition reliant Bibracte, la philosophie antique et un judaïsme messianique évangélique."
    ],
    academicCounterpointTitle: 'Lecture de l’histoire de l’art médiéval',
    academicCounterpoint:
      "Les médiévistes et historiens de l'art (CNRS / CEM Auxerre) inscrivent les programmes sculptés de Vézelay, d'Autun et de Chalon-sur-Saône dans la théologie monastique bénédictine et clunisienne des XIe–XIIe siècles (Pentecôte, Jugement dernier, typologie biblique), sans filiation documentée avec le druidisme antique ou l'essénisme.",
    keySources: [
      {
        label: 'S. Chardonnet — Sculpture romane de Vézelay (CNRS HAL-SHS, 2025)',
        url: 'https://hal.science/hal-05329473v1',
        institution: 'CNRS HAL-SHS',
        kind: 'scientific'
      },
      {
        label: 'Bulletin du Centre d’études médiévales d’Auxerre (BUCEMA) — Art roman bourguignon',
        url: 'https://journals.openedition.org/cem/',
        institution: 'OpenEdition / CNRS',
        kind: 'scientific'
      },
      {
        label: 'Basilique Sainte-Marie-Madeleine de Vézelay — Archives patrimoniales (POP / Ministère de la Culture)',
        url: 'https://pop.culture.gouv.fr/search/list?mainSearch=%22V%C3%A9zelay%22%20tympan',
        institution: 'Ministère de la Culture (Base POP)',
        kind: 'archive'
      }
    ],
    bookExcerpts: [
      {
        bookId: 'mourey-bibracte-tome-4-dieu-rayonnant',
        bookTitle: 'Histoire de Bibracte',
        tome: 'Tome 4 : Dieu Rayonnant',
        page: 'p. 20',
        heading: 'Le temple d’Apollon au Mont-Saint-Vincent et la pensée celte',
        quote:
          "« Bibracte ! Cité antique de notre patrie ! Foyer de la pensée ! Faudra-t-il bouleverser ton sol pour mettre à jour les vestiges illustres qui nous donneront la clef de la religion des Celtes ? Où sont les ruines de ton temple d'Apollon dont nous avons situé très exactement l'emplacement à la pointe nord du Mont-Saint-Vincent ? »"
      },
      {
        bookId: 'mourey-bibracte-tome-4-dieu-rayonnant',
        bookTitle: 'Histoire de Bibracte',
        tome: 'Tome 4 : Dieu Rayonnant',
        page: 'p. 163 & 170',
        heading: 'Essai d’interprétation du tympan d’origine de Vézelay',
        quote:
          "« Au centre, le Dieu de Gourdon a été remis sur son trône de Bibracte. À la différence du Dieu d'Autun, il ne condamne plus. Il accueille des deux mains. [...] À gauche de Dieu, sous le feuillage d'un chêne, au pied d'un rocher qui les surplombe, se tiennent les six notables probablement du Sénat de Bibracte. »"
      }
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
      "En deux tomes, l'auteur soumet les récits évangéliques à la même grille d'analyse historique que les campagnes de César : procédures juridiques romaines, contexte politique de Judée, Qumrân et circulation des idées vers la Gaule.",
    moureyPoints: [
      "Confrontation des récits de la Passion au droit pénal romain en vigueur sous Ponce Pilate et aux tensions entre courants religieux du Ier siècle.",
      "Mise en lumière de la matrice essénienne (Qumrân) et judéo-chrétienne dans la formation des premiers textes évangéliques.",
      "Suivi de la diffusion des communautés judéo-chrétiennes le long des axes fluviaux (Rhône, Saône) jusqu'au cœur de la Bourgogne éduenne."
    ],
    academicCounterpointTitle: 'Exégèse historico-critique contemporaine',
    academicCounterpoint:
      "La recherche universitaire distingue les couches rédactionnelles des quatre Évangiles (rédigés entre 70 et 100 apr. J.-C.), souligne la complexité des rapports entre Jésus et le mouvement essénien de Qumrân, et date l'implantation archéologiquement attestée du christianisme en Gaule du IIe siècle (Lyon et Vienne, 177).",
    keySources: [
      {
        label: 'Manuscrits de la mer Morte (Qumrân) — Bibliothèque numérique d’Israël',
        url: 'https://www.deadseascrolls.org.il/?locale=fr_FR',
        institution: 'Leon Levy Dead Sea Scrolls Digital Library',
        kind: 'archive'
      },
      {
        label: 'Recherches CNRS HAL-SHS sur Qumrân, les Esséniens & le judéo-christianisme',
        url: 'https://hal.science/search/index/?q=Qumran+Esseniens',
        institution: 'CNRS HAL-SHS',
        kind: 'scientific'
      },
      {
        label: 'Flavius Josèphe, Antiquités judaïques (texte intégral)',
        url: 'https://remacle.org/bloodwolf/historiens/Flajose/index.htm',
        institution: 'Source antique (Ier siècle)',
        kind: 'antique'
      }
    ],
    bookExcerpts: [
      {
        bookId: 'mourey-christ-tome-1',
        bookTitle: 'Histoire du Christ',
        tome: 'Tome 1',
        page: 'p. 40',
        heading: 'De la Méditerranée à la Gaule : Gésocribate et la Table de Peutinger',
        quote:
          "« La conclusion s'impose : Samothrace, l'île de Sein, Gergovie, sont avec Delphes et d'autres sites prestigieux les lieux saints d'une mystique qui plonge ses racines dans le passé le plus lointain, une mystique née dans la Grèce antique, et peut-être même au-delà. La carte de Peutinger nous invite à voir l'île de Sein dans la station de Gésocribate. »"
      },
      {
        bookId: 'mourey-christ-tome-1',
        bookTitle: 'Histoire du Christ',
        tome: 'Tome 1',
        page: 'p. 48',
        heading: 'L’attente messianique entre Qumrân et Jérusalem',
        quote:
          "« On y trouve l'espérance de la venue d'un Messie d'Aaron et d'Israël mais pas sous la forme d'un Jésus. Et pourtant, l'Évangile prouve qu'on l'attendait ainsi, avec son cortège de bergers et de rois mages. [...] Qoumrân se trouvait dans l'orbite territoriale des Juifs de Jérusalem. »"
      }
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
      "Dans ses deux tomes consacrés à Mahomet (manuscrits consultables par extraits), Émile Mourey propose une lecture structurale audacieuse des origines de l'islam dans le prolongement de ses travaux sur le judéo-christianisme et l'essénisme.",
    moureyPoints: [
      "Les grandes figures prophétiques (Abraham, Jésus, Mahomet) sont interprétées comme des désignations collectives de « conseils » directeurs ou sacerdotaux plutôt que de simples biographies individuelles.",
      "Les « épouses » mentionnées par la tradition (Sarah, Agar, Khadidja, Aïscha) sont lues comme des symboles de « populations » alliées ou de « troupes militaires » structurant l'expansion.",
      "Les batailles fondatrices (Beder, Ohod, prise de La Mecque) sont décodées comme des manœuvres politico-militaires s'inscrivant dans la continuité du monothéisme essénien."
    ],
    academicCounterpointTitle: 'Islamologie historique et philologie',
    academicCounterpoint:
      "L'islamologie universitaire contemporaine (CNRS / EPHE / projet Coranica), bien qu'elle examine avec distance critique les sources tardives comme Tabari (IXe–Xe siècles), inscrit la naissance de l'islam dans le contexte historique, épigraphique et linguistique de l'Arabie du VIIe siècle et ne valide pas la réduction systématique des personnages à des allégories institutionnelles ou militaires.",
    keySources: [
      {
        label: 'Recherches CNRS HAL-SHS sur l’historiographie des origines de l’islam & du Coran',
        url: 'https://hal.science/search/index/?q=origines+islam+Coran+historiographie',
        institution: 'CNRS HAL-SHS',
        kind: 'scientific'
      },
      {
        label: 'Chronique de Tabari (éd. Hermann Zotenberg — Gallica / BnF)',
        url: 'https://gallica.bnf.fr/services/engine/search/sru?operation=searchRetrieve&version=1.2&query=(gallica%20all%20%22Chronique%20de%20Tabari%22)',
        institution: 'Bibliothèque nationale de France (Gallica)',
        kind: 'archive'
      },
      {
        label: 'Projet franco-allemand Coranica (CNRS / Académie des Inscriptions)',
        url: 'https://www.aibl.fr/',
        institution: 'AIBL / CNRS',
        kind: 'scientific'
      }
    ],
    bookExcerpts: [
      {
        bookId: 'mourey-mahomet-tome-1',
        bookTitle: 'Histoire de Mahomet',
        tome: 'Tome 1',
        page: 'p. 12',
        heading: 'Généalogie d’Abraham et lecture symbolique des lignées',
        quote:
          "« La généalogie de Mahomet nous est parvenue à travers plusieurs écrits d'auteurs arabes. On le fait descendre en droite ligne d'Adam, puis d'Abraham. [...] La branche juive est issue de l'union d'Abraham et de Sarah (les troupes araméennes venues de Syrie), la branche de Mahomet de l'union d'Abraham et d'Agar (les troupes égyptiennes). »"
      },
      {
        bookId: 'mourey-mahomet-tome-1',
        bookTitle: 'Histoire de Mahomet',
        tome: 'Tome 1',
        page: 'p. 25',
        heading: 'Une influence essénienne et les trois principes fondateurs',
        quote:
          "« Prenant acte de la situation de son époque, Mahomet a fait preuve d’une grande habileté [...] d’où son idée de revenir aux sources pour rétablir, selon lui, un droit chemin reposant sur trois principes de base : Un seul Dieu, qui ne se partage pas. Une seule religion, qui ne se discute pas. Un seul peuple, soumis à Dieu et à ses guides. »"
      }
    ],
    relatedBookIds: ['mourey-mahomet-tome-1', 'mourey-mahomet-tome-2'],
    agoravoxUrl: 'https://www.agoravox.fr/actualites/religions/article/du-precheur-pacifique-au-chef-de-221651',
    agoravoxLabel: 'Articles Religions & Sources sur AgoraVox'
  },
  {
    id: 'dossier-metaphysique-agoravox',
    slug: 'metaphysique-et-agoravox',
    number: '07',
    domain: 'Textes sacrés & Philosophie',
    title: 'Quête métaphysique et 20 ans de débats sur AgoraVox',
    subtitle: '« Qu’est-ce que l’homme ? », 559 articles publiés et patrimoine bourguignon',
    lead:
      "Au-delà de la topographie antique, l'œuvre d'Émile Mourey porte une interrogation philosophique constante face au matérialisme moderne, nourrie par vingt années de publication citoyenne et plus de 22 700 commentaires débattus sur AgoraVox.",
    moureyPoints: [
      "Une réflexion métaphysique (« Qu'est-ce que l'homme ? ») dialoguant de façon critique avec l'humanisme matérialiste contemporain en faveur d'une évolution spirituelle guidée par « Ce qui nous dépasse ».",
      "Un corpus exceptionnel de 559 articles et 22 784 commentaires archivés et indexés depuis AgoraVox, débattus pied à pied par l'auteur avec plus de 1 300 intervenants.",
      "Un engagement personnel pour la mémoire historique bourguignonne et le Château de Taisey, prolongé aujourd'hui par l'édition papier de collection et l'édition numérique."
    ],
    academicCounterpointTitle: 'Réception critique et pluralisme des lectures',
    academicCounterpoint:
      "La réception publique sur AgoraVox reflète une forte polarisation : d'un côté des lecteurs fidèles saluant la ténacité, la clarté pédagogique tactique et le refus des dogmes ; de l'autre des contradicteurs sceptiques qui contestent la méthode et défendent l'archéologie académique ou le rationalisme matérialiste.",
    keySources: [
      {
        label: 'Profil officiel d’Émile Mourey sur AgoraVox (559+ articles)',
        url: 'https://www.agoravox.fr/auteur/emile-mourey',
        institution: 'AgoraVox — Média citoyen',
        kind: 'archive'
      },
      {
        label: 'La Gaule en héritage — Réflexions sur la mémoire gauloise & la Table de Peutinger',
        url: 'https://pmourey.github.io/Livres-de-Jean/?livre=mourey-gaule-en-heritage',
        institution: 'Éditions Émile Mourey',
        kind: 'book'
      }
    ],
    bookExcerpts: [
      {
        bookId: 'mourey-gaule-en-heritage',
        bookTitle: 'La Gaule en héritage',
        tome: '1ère partie',
        page: 'p. 63',
        heading: 'Le droit au débat critique face aux institutions',
        quote:
          "« Il est écrit dans un livre que vous avez certainement lu que lorsque des réunions de travail se tiennent, probablement au Centre archéologique européen, il arrive que l’on fasse des plaisanteries aux dépens d’historiens qui auraient découvert… un nouveau site. [...] C'est précisément par la confrontation loyale des textes et du terrain que progresse la connaissance. »"
      }
    ],
    relatedBookIds: ['mourey-gaule-en-heritage', 'mourey-coffret-integrale-bibracte'],
    agoravoxUrl: 'https://www.agoravox.fr/auteur/emile-mourey',
    agoravoxLabel: 'Parcourir les articles sur AgoraVox'
  },
  {
    id: 'dossier-wikipedia-recherche-independante',
    slug: 'wikipedia-censure-recherche-independante',
    number: '08',
    domain: 'Textes sacrés & Philosophie',
    title: 'Wikipédia, auto-édition et éthique du débat : le droit à la recherche indépendante',
    subtitle: 'Lettre ouverte à Wikipédia (2009), attaques ad hominem et place des chercheurs hors institution',
    lead:
      "En novembre 2009, suite au rejet de ses contributions sur Wikipédia au motif qu'il publie en auto-édition sans comité de lecture universitaire, Émile Mourey publie sur AgoraVox une « Lettre ouverte à Wikipédia au sujet de Bibracte et de Gergovie ». Les échanges qui s'ensuivent posent une question de fond : l'absence de label académique justifie-t-elle la censure d'une argumentation vérifiable ou le recours aux insultes ad hominem ?",
    moureyPoints: [
      "Refus de l'argument d'autorité et des attaques ad hominem : face à un contributeur universitaire de Wikipédia qualifiant ses livres de « vaste imposture », d'« élucubrations » et de « délires » (propos relayés le 20 novembre 2009 sous l'article AgoraVox), Émile Mourey rappelle que « à défaut d'arguments qui prouveraient que le mont Beuvray est le site de Bibracte, [viennent] les insultes ».",
      "Critique du verrouillage éditorial (« entre-soi » des comités) : l'auteur explique pourquoi l'auto-édition indépendante ne préjuge pas de la validité d'un raisonnement topographique ou philologique — « Que mon avis soit minoritaire ? Et alors, est-ce une raison pour refuser le débat ? » — et souligne qu'un chercheur libre doit pouvoir interpeller les institutions sans être disqualifié sur son statut.",
      "Distinction entre vérification des faits et statut de l'auteur : dans le fil du 20 novembre 2009, des lecteurs comme Rétif rappellent que la rigueur encyclopédique ne consiste pas à censurer toute hypothèse minoritaire ni à se retrancher derrière le mépris, mais à répondre point par point sur les pièces (textes de César, distances, stratigraphie). L'auteur relève également la déformation de ses propres thèses (il n'a jamais qualifié le mont Beuvray de « site mineur », mais d'oppidum stratégique majeur : Gorgobina)."
    ],
    academicCounterpointTitle: 'Règles de vérifiabilité encyclopédique (Wikipédia) & éthique scientifique',
    academicCounterpoint:
      "Les règles de Wikipédia (WP:Vérifiabilité, WP:Travaux inédits, WP:Proportion) imposent de s'appuyer sur des sources secondaires publiées par des revues à comité de lecture ou des maisons d'édition reconnues, et excluent par principe les ouvrages auto-édités afin d'éviter la diffusion de théories non évaluées par les pairs. Toutefois, la communauté scientifique et les principes mêmes de Wikipédia (WP:Règles de savoir-vivre, WP:Pas d'attaque personnelle) condamnent formellement le mépris et l'insulte ad hominem : la critique légitime d'une thèse minoritaire doit porter exclusivement sur la méthode et les preuves matérielles, jamais sur la dignité de l'auteur.",
    keySources: [
      {
        label: 'É. Mourey — Lettre ouverte à Wikipédia au sujet de Bibracte et de Gergovie (AgoraVox, nov. 2009)',
        url: 'https://www.agoravox.fr/tribune-libre/article/lettre-ouverte-a-wikipedia-au-65265',
        institution: 'AgoraVox — Article original',
        kind: 'archive'
      },
      {
        label: 'Échange du 20 nov. 2009 — Réponse d’Émile Mourey aux attaques (forum #2315779)',
        url: 'https://www.agoravox.fr/tribune-libre/article/lettre-ouverte-a-wikipedia-au-65265#forum2315779',
        institution: 'AgoraVox — Réponse de l’auteur',
        kind: 'archive'
      },
      {
        label: 'Commentaire de Rétif sur les limites de Wikipédia (forum #2316695)',
        url: 'https://www.agoravox.fr/tribune-libre/article/lettre-ouverte-a-wikipedia-au-65265#forum2316695',
        institution: 'AgoraVox — Débat lecteurs',
        kind: 'archive'
      },
      {
        label: 'Wikipédia — Règles de savoir-vivre & Pas d’attaque personnelle (WP:PAP)',
        url: 'https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Pas_d%27attaque_personnelle',
        institution: 'Charte officielle Wikipédia',
        kind: 'scientific'
      },
      {
        label: 'Wikipédia — Travaux inédits & Sources secondaires (WP:TI)',
        url: 'https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Travaux_in%C3%A9dits',
        institution: 'Charte officielle Wikipédia',
        kind: 'scientific'
      }
    ],
    bookExcerpts: [
      {
        bookId: 'mourey-gaule-en-heritage',
        bookTitle: 'La Gaule en héritage',
        tome: '1ère partie',
        page: 'p. 63',
        heading: 'Lettre du 15 janvier 2003 adressée au bilan scientifique Gallia 55',
        quote:
          "« Il est écrit dans un livre que vous avez certainement lu que lorsque des réunions de travail se tiennent, probablement au Centre archéologique européen, il arrive que l’on fasse des plaisanteries aux dépens d’historiens qui auraient découvert… un nouveau site. [...] À défaut d'arguments qui prouveraient que le mont Beuvray est le site de Bibracte, les insultes. Que mon avis soit minoritaire ? Et alors, est-ce une raison pour refuser le débat ? »"
      },
      {
        bookId: 'mourey-bibracte-tome-2-bouclier-eduen',
        bookTitle: 'Histoire de Bibracte',
        tome: 'Tome 2 : Le Bouclier Éduen',
        page: 'p. 106',
        heading: 'Réponse à la caricature : le Mont-Beuvray n’a jamais été qualifié de « site mineur »',
        quote:
          "« Le Mont-Beuvray ne fut pas Bibracte ; mais il faut cependant lui rendre justice : il fut un des plus importants oppidum de la cité éduenne. [...] Le Mont-Beuvray était le double du Mont-Saint-Vincent sur le plan de la stratégie territoriale. »"
      }
    ],
    relatedBookIds: ['mourey-gaule-en-heritage', 'mourey-bibracte-tome-2-bouclier-eduen', 'mourey-gergovie-tome-1'],
    agoravoxUrl: 'https://www.agoravox.fr/tribune-libre/article/lettre-ouverte-a-wikipedia-au-65265#forum2316695',
    agoravoxLabel: 'Lire la Lettre ouverte à Wikipédia & débats'
  }
];

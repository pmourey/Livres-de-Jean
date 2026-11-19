import React from 'react';
import {
  BookOpen,
  Compass,
  Scale,
  AlertCircle,
  Quote,
  MessageSquare,
  ExternalLink,
  ArrowRight,
  ScrollText,
  MapPin,
  Shield,
  Sparkles
} from 'lucide-react';
import { AGORAVOX_CARDS, AGORAVOX_META } from '../data/agoravoxQuotes';
import { CommentsSection } from './CommentsSection';

interface MethodControversySectionProps {
  onNavigateCatalog: () => void;
  onNavigateLegal?: () => void;
  onNavigateAccount?: () => void;
  customerToken?: string;
  defaultAuthorName?: string;
}

export const MethodControversySection: React.FC<MethodControversySectionProps> = ({
  onNavigateCatalog,
  onNavigateLegal,
  onNavigateAccount,
  customerToken = '',
  defaultAuthorName = ''
}) => {
  return (
    <div className="space-y-14 pb-12">
      {/* En-tête éditorial */}
      <section className="relative overflow-hidden bg-[#241310] text-[#FAF8F5] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 rounded-b-2xl shadow-xl">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />

        <div className="relative max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-cinzel tracking-[0.22em] uppercase font-bold">
            <Compass className="w-4 h-4" />
            <span>Éditions Émile Mourey · Démarche & Débat Historique</span>
          </div>

          <h1 className="font-serif-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Méthode et Controverse
          </h1>

          <p className="font-serif-display italic text-lg sm:text-xl text-stone-200 max-w-4xl leading-relaxed">
            Ancien <strong>officier saint-cyrien</strong>, Émile Mourey conduit depuis plusieurs décennies une <strong>contre-enquête historique et religieuse</strong> fondée sur le retour strict aux textes sources, l'analyse tactique du terrain et la confrontation sans détour avec l'archéologie contemporaine.
          </p>

          {/* Disponibilité des ouvrages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-4xl">
            <div className="bg-stone-900/80 border border-[#D4AF37]/40 rounded-lg p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-white block text-sm font-serif-display">
                  Édition papier de collection limitée
                </strong>
                <p className="text-stone-300 leading-relaxed">
                  Tirages auto-édités en nombre restreint, avec appareil cartographique et dédicace manuscrite de l'auteur.
                </p>
              </div>
            </div>

            <div className="bg-stone-900/80 border border-stone-700 rounded-lg p-4 flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-white block text-sm font-serif-display">
                  Format numérique Kindle
                </strong>
                <p className="text-stone-300 leading-relaxed">
                  L'ensemble des cycles (Alésia, Bibracte, Gergovie, Histoire du Christ) est également accessible en édition numérique Kindle.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateCatalog}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1E2D] hover:bg-[#A32335] text-white text-xs font-semibold rounded-md shadow transition-colors cursor-pointer"
            >
              <span>Parcourir le catalogue des ouvrages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onNavigateLegal && (
              <button
                onClick={onNavigateLegal}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-stone-500/80 hover:bg-white/10 text-stone-200 text-xs font-medium rounded-md transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Lire la Charte éditoriale</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Parcours en 3 étapes croisant Alésia et Bibracte */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="font-cinzel text-xs uppercase tracking-widest text-[#8B1E2D] font-bold">
            Parcours Méthodologique en 3 Étapes
          </span>
          <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#2B1810]">
            Croiser les dossiers Alésia et Bibracte
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            La méthode d'Émile Mourey s'articule en trois temps successifs : l'exégèse rigoureuse du latin de César, la vérification tactique sur la carte et le relief, puis la mise à l'épreuve face aux données archéologiques et aux objections scientifiques.
          </p>
        </div>

        {/* ÉTAPE 1 */}
        <article className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
          <div className="bg-[#F5F1E9] border-b border-stone-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#8B1E2D] text-white font-cinzel font-bold text-sm shadow-xs">
                01
              </span>
              <div>
                <span className="font-cinzel text-[11px] uppercase tracking-wider text-[#8B1E2D] font-bold block">
                  Étape 1
                </span>
                <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2B1810]">
                  Relire les textes antiques
                </h3>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-white px-3 py-1 rounded-full border border-stone-200">
              <ScrollText className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Retraduction stricte de Jules César</span>
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <p className="text-sm text-stone-700 leading-relaxed text-justify">
              Toute contre-enquête débute par une <strong>retraduction littérale</strong> du <em>De Bello Gallico</em>, dépouillée des gloses du XIX<sup>e</sup> siècle qui ont parfois plié le texte latin pour le faire coïncider avec des sites préalablement choisis. Deux tournures précises illustrent cette exigence philologique :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-xs uppercase tracking-wider font-bold text-[#8B1E2D]">
                    Dossier Alésia
                  </span>
                  <span className="text-[11px] font-mono bg-stone-200/80 text-stone-800 px-2 py-0.5 rounded">
                    altero die
                  </span>
                </div>
                <h4 className="font-serif-display font-bold text-lg text-[#2B1810]">
                  La bataille de cavalerie vers Noyers-sur-Serein
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed text-justify">
                  Dans le livre VII, l'expression latine <strong><em>altero die</em></strong> (« le lendemain » / « le second jour ») fixe un intervalle de marche précis entre l'engagement de cavalerie préliminaire et l'arrivée devant l'oppidum d'Alésia. En respectant cette chronologie et la vitesse de déplacement d'une colonne romaine, Émile Mourey situe la bataille de cavalerie dans le secteur de <strong>Noyers-sur-Serein</strong>, en amont du dispositif d'encerclement.
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-xs uppercase tracking-wider font-bold text-[#8B1E2D]">
                    Dossier Bibracte
                  </span>
                  <span className="text-[11px] font-mono bg-stone-200/80 text-stone-800 px-2 py-0.5 rounded">
                    itinere converso
                  </span>
                </div>
                <h4 className="font-serif-display font-bold text-lg text-[#2B1810]">
                  Itinere converso & carte de Peutinger vers le Mont-Saint-Vincent
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed text-justify">
                  Dans le livre I, le décrochage de César vers la capitale éduenne (<strong><em>itinere converso</em></strong> — « ayant infléchi son itinéraire ») pour ravitailler ses légions, croisé avec les distances routières de la <strong>Table de Peutinger</strong>, oriente l'analyse non vers le massif isolé du Morvan, mais vers le nœud stratégique du <strong>Mont-Saint-Vincent</strong> en Saône-et-Loire.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* ÉTAPE 2 */}
        <article className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
          <div className="bg-[#F5F1E9] border-b border-stone-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#8B1E2D] text-white font-cinzel font-bold text-sm shadow-xs">
                02
              </span>
              <div>
                <span className="font-cinzel text-[11px] uppercase tracking-wider text-[#8B1E2D] font-bold block">
                  Étape 2
                </span>
                <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2B1810]">
                  Appliquer la logique militaire au terrain
                </h3>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-white px-3 py-1 rounded-full border border-stone-200">
              <MapPin className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Topographie, lignes de crête & manœuvres</span>
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <p className="text-sm text-stone-700 leading-relaxed text-justify">
              Un récit d'opérations militaires rédigé par un chef de guerre obéit à des lois physiques invariables : dénivelés, champs de tir, points d'eau, couloirs d'approche et capacités de déploiement des unités. L'œil de l'officier saint-cyrien confronte chaque phrase aux courbes de niveau :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-5 space-y-2.5">
                <span className="font-cinzel text-xs uppercase tracking-wider font-bold text-[#8B1E2D] block">
                  Dossier Alésia · Manœuvre de siège
                </span>
                <h4 className="font-serif-display font-bold text-lg text-[#2B1810]">
                  Le déploiement sur la montagne de Bussy
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed text-justify">
                  L'analyse tactique du siège d'Alésia examine l'articulation entre l'oppidum, les plaines environnantes et les hauteurs dominantes, en particulier le <strong>déploiement sur la montagne de Bussy</strong>. L'implantation des camps romains, la surveillance des mouvements de l'armée de secours et l'économie des lignes de circonvallation y sont réévaluées à l'aune des contraintes réelles du commandement.
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-5 space-y-2.5">
                <span className="font-cinzel text-xs uppercase tracking-wider font-bold text-[#8B1E2D] block">
                  Dossier Bibracte · Campagne de 58 av. J.-C.
                </span>
                <h4 className="font-serif-display font-bold text-lg text-[#2B1810]">
                  Bataille des Helvètes à Sanvignes & mont Beuvray comme Gorgobina
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed text-justify">
                  En restituant les axes de marche depuis la Saône, Émile Mourey replace la <strong>bataille des Helvètes dans le bassin de Sanvignes</strong> (au pied du Mont-Saint-Vincent), là où le relief permet l'établissement du dispositif romain en triple ligne et le repli helvète. Dans cette cohérence d'ensemble, le <strong>mont Beuvray</strong> retrouve une lecture stratégique nouvelle : celle de <strong>Gorgobina</strong>, place-forte confiée aux Boïens sur la marche occidentale du territoire éduen.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* ÉTAPE 3 + Encadré Objection des archéologues */}
        <article className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
          <div className="bg-[#F5F1E9] border-b border-stone-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#8B1E2D] text-white font-cinzel font-bold text-sm shadow-xs">
                03
              </span>
              <div>
                <span className="font-cinzel text-[11px] uppercase tracking-wider text-[#8B1E2D] font-bold block">
                  Étape 3
                </span>
                <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2B1810]">
                  Confronter aux vestiges et ouvrir le débat
                </h3>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-white px-3 py-1 rounded-full border border-stone-200">
              <Scale className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Archéologie de terrain & débat critique</span>
            </span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Relecture des fouilles */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="font-serif-display font-bold text-lg text-[#2B1810]">
                Relecture des fouilles de 1992 à Alésia et du bilan CNRS <em>Gallia</em> 55
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed text-justify">
                Loin d'ignorer la documentation archéologique officielle, la démarche d'Émile Mourey passe au crible les publications scientifiques de référence, notamment les <strong>fouilles franco-allemandes engagées à partir de 1992 à Alésia</strong> ainsi que le grand <strong>bilan publié par le CNRS dans la revue <em>Gallia</em> (tome 55, 1998)</strong>.
              </p>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed text-justify">
                L'auteur examine la datation des fossés, la dispersion du mobilier militaire, les monnaies et les profils de fortifications pour discuter ce que les vestiges attestent formellement et ce qui relève, selon lui, d'une interprétation héritée. L'objectif affiché n'est pas de clore la discussion, mais de soumettre chaque pièce du dossier au jugement critique du lecteur.
              </p>
            </div>

            {/* Encadré distinct : Objection principale des archéologues */}
            <aside
              aria-label="Objection principale des archéologues"
              className="lg:col-span-5 bg-amber-50/80 border-2 border-amber-300/90 rounded-lg p-5 space-y-3 shadow-2xs"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-cinzel text-[10px] uppercase tracking-widest text-amber-900 font-bold block">
                    Point de vue contradictoire
                  </span>
                  <h4 className="font-serif-display font-bold text-base text-amber-950">
                    L'objection principale des archéologues
                  </h4>
                </div>
              </div>

              <p className="text-xs text-amber-950/90 leading-relaxed text-justify">
                Pour l'archéologie universitaire et les équipes du CNRS, la limite majeure d'une démarche qui place la relecture des textes antiques en premier lieu est méthodologique : <strong>subordonner les fouilles aux textes expose au biais de confirmation</strong>.
              </p>

              <p className="text-xs text-amber-900/90 leading-relaxed text-justify">
                Selon cette approche, les traces matérielles (stratigraphie, datations dendrochronologiques et numismatiques, typologie des armements et des fossés) doivent être analysées de manière autonome, indépendamment des hypothèses littéraires, afin d'éviter de projeter sur un paysage ce que l'on espère y retrouver.
              </p>

              <div className="pt-2 border-t border-amber-200/90 text-[11px] text-amber-900 italic">
                Exposer loyalement cette objection fait partie intégrante de la charte éditoriale des Éditions Émile Mourey.
              </div>
            </aside>
          </div>
        </article>
      </section>

      {/* Bloc "Voix d'AgoraVox" (placé juste après l'étape 3) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <span className="font-cinzel text-xs uppercase tracking-widest text-[#8B1E2D] font-bold flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Débats Publics & Réception</span>
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1810]">
              Voix d’AgoraVox
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
              {AGORAVOX_META.sectionSubtitle}
            </p>
          </div>

          <a
            href={AGORAVOX_META.authorProfileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B1E2D] hover:text-[#721824] underline underline-offset-4 shrink-0"
          >
            <span>{AGORAVOX_META.articleCount} articles sur AgoraVox</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {AGORAVOX_CARDS.map((card) => {
            if (card.kind === 'testimonial') {
              return (
                <div
                  key={card.id}
                  className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-cinzel uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-stone-100 text-[#8B1E2D] border border-stone-200">
                        {card.badge}
                      </span>
                      <Quote className="w-5 h-5 text-[#D4AF37]" />
                    </div>

                    <h3 className="font-serif-display font-bold text-lg text-[#2B1810]">
                      {card.title}
                    </h3>

                    <blockquote className="font-serif-display italic text-sm text-stone-700 leading-relaxed border-l-3 border-[#8B1E2D] pl-3.5">
                      « {card.quote} »
                    </blockquote>
                  </div>

                  <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 space-y-0.5">
                    <strong className="text-stone-800 block">{card.readerLabel}</strong>
                    <span>{card.context}</span>
                    <span className="block text-[10px] text-stone-400 italic">
                      {card.sourceNote}
                    </span>
                  </div>
                </div>
              );
            }

            if (card.kind === 'debate') {
              return (
                <div
                  key={card.id}
                  className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-cinzel uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        {card.badge}
                      </span>
                      <Scale className="w-4 h-4 text-amber-700" />
                    </div>

                    <h3 className="font-serif-display font-bold text-lg text-[#2B1810]">
                      {card.title}
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
                        <span className="font-bold text-stone-800 block">
                          {card.objectionAuthor}
                        </span>
                        <p className="text-stone-600 italic leading-relaxed">
                          {card.objectionText}
                        </p>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] border-l-3 border-[#8B1E2D] rounded-r-lg space-y-1">
                        <span className="font-bold text-[#8B1E2D] block">
                          {card.authorReplyName}
                        </span>
                        <p className="text-stone-800 leading-relaxed">
                          {card.authorReplyText}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    {card.context}
                  </div>
                </div>
              );
            }

            // archive_cta card
            return (
              <div
                key={card.id}
                className="bg-gradient-to-br from-[#2B1810] to-[#3D1D16] text-[#FAF8F5] border border-[#D4AF37]/40 rounded-xl p-6 shadow-md flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-cinzel uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30">
                      {card.badge}
                    </span>
                    <span className="font-serif-display font-bold text-2xl text-[#D4AF37] tabular-nums">
                      {card.articleCount}
                    </span>
                  </div>

                  <h3 className="font-serif-display font-bold text-xl text-white">
                    {card.title}
                  </h3>

                  <p className="text-xs text-stone-200 leading-relaxed text-justify">
                    {card.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <a
                    href={card.agoravoxUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#C5A028] text-stone-950 font-bold text-xs rounded-md transition-colors shadow-xs"
                  >
                    <span>{card.agoravoxCtaLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>

                  <button
                    type="button"
                    onClick={onNavigateCatalog}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold text-xs rounded-md transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{card.catalogCtaLabel}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Espace de commentaires modérés a priori (placé sous Voix d'AgoraVox) */}
      <CommentsSection
        targetSlug="methode-et-controverse"
        customerToken={customerToken}
        defaultAuthorName={defaultAuthorName}
        onNavigateAccount={onNavigateAccount || onNavigateCatalog}
        onNavigateLegal={onNavigateLegal}
      />
    </div>
  );
};

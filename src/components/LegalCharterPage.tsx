import React from 'react';
import { AUTHOR_INFO } from '../data/initialData';
import {
  ShieldCheck,
  Scale,
  BookOpen,
  FileText,
  Lock,
  Landmark,
  Compass,
  ArrowRight
} from 'lucide-react';

interface LegalCharterPageProps {
  onNavigateCatalog: () => void;
  onNavigateMethod: () => void;
  onOpenCgv: () => void;
}

export const LegalCharterPage: React.FC<LegalCharterPageProps> = ({
  onNavigateCatalog,
  onNavigateMethod,
  onOpenCgv
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* En-tête de la page */}
      <header className="text-center space-y-3 border-b border-stone-200 pb-8">
        <span className="font-cinzel text-xs uppercase tracking-[0.22em] text-[#8B1E2D] font-bold inline-flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparence Éditoriale & Cadre Réglementaire</span>
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2B1810]">
          Charte et Mentions légales
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Principes déontologiques de la maison d'auto-édition Éditions Émile Mourey et informations légales obligatoires relatives à l'éditeur, à la propriété intellectuelle et à la protection des données.
        </p>
      </header>

      {/* PARTIE 1 : Charte éditoriale */}
      <section className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        <div className="bg-[#F5F1E9] border-b border-stone-200 px-6 py-4 flex items-center gap-2.5">
          <Scale className="w-5 h-5 text-[#8B1E2D]" />
          <h2 className="font-serif-display text-xl font-bold text-[#2B1810]">
            I. Charte éditoriale et déontologique
          </h2>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-700 leading-relaxed text-justify">
          <div className="space-y-2">
            <h3 className="font-serif-display font-bold text-sm text-[#2B1810]">
              1. Indépendance de la contre-enquête
            </h3>
            <p>
              Les Éditions Émile Mourey publient en auto-édition indépendante les travaux historiques, topographiques et religieux de Monsieur Émile Mourey, ancien officier saint-cyrien. Ce choix éditorial garantit une liberté totale d'analyse, sans pression commerciale ni dépendance institutionnelle.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif-display font-bold text-sm text-[#2B1810]">
              2. Loyauté envers le débat contradictoire
            </h3>
            <p>
              Les thèses défendues (localisation de Bibracte au Mont-Saint-Vincent, relecture du siège d'Alésia, analyse historique des textes fondateurs) s'inscrivent dans une démarche assumée de contre-enquête. La maison d'édition veille à distinguer ses hypothèses du consensus universitaire et à exposer loyalement les objections archéologiques majeures.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif-display font-bold text-sm text-[#2B1810]">
              3. Disponibilité et formats des ouvrages
            </h3>
            <p>
              Les titres publiés sont diffusés en <strong>édition papier de collection limitée</strong> (avec dédicace personnalisée offerte lors des périodes d'ouverture des commandes) ainsi qu'au <strong>format numérique Kindle</strong>. Les manuscrits inédits sans dépôt légal demeurent hors commerce et accessibles uniquement sous forme d'extraits certifiés.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif-display font-bold text-sm text-[#2B1810]">
              4. Respect des lecteurs et de la critique
            </h3>
            <p>
              Les échanges publics — notamment autour des 563 articles publiés sur AgoraVox — sont encouragés dans un esprit de rigueur factuelle, de courtoisie et de confrontation directe aux textes sources et aux relevés de terrain.
            </p>
          </div>
        </div>
      </section>

      {/* PARTIE 2 : Mentions légales obligatoires */}
      <section className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        <div className="bg-[#F5F1E9] border-b border-stone-200 px-6 py-4 flex items-center gap-2.5">
          <Landmark className="w-5 h-5 text-[#8B1E2D]" />
          <h2 className="font-serif-display text-xl font-bold text-[#2B1810]">
            II. Mentions légales
          </h2>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-xs text-stone-700 leading-relaxed text-justify">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-5 space-y-2">
              <h3 className="font-bold text-stone-900 text-sm">
                1. Éditeur du site & Directeur de publication
              </h3>
              <ul className="space-y-1">
                <li>
                  <strong>Éditeur :</strong> {AUTHOR_INFO.name}
                </li>
                <li>
                  <strong>Statut juridique :</strong> {AUTHOR_INFO.legalForm}
                </li>
                <li>
                  <strong>Numéro SIREN :</strong>{' '}
                  <span className="font-mono font-semibold text-stone-900">{AUTHOR_INFO.siren}</span>
                </li>
                <li>
                  <strong>Code APE / NAF :</strong> {AUTHOR_INFO.activityCode}
                </li>
                <li>
                  <strong>Immatriculation :</strong> {AUTHOR_INFO.registrationStatus}
                </li>
                <li>
                  <strong>Régime fiscal :</strong> {AUTHOR_INFO.tvaStatus}
                </li>
                <li>
                  <strong>Adresse postale :</strong> {AUTHOR_INFO.postalAddress}
                </li>
                <li>
                  <strong>Contact électronique :</strong> {AUTHOR_INFO.contactEmail}
                </li>
              </ul>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded-lg p-5 space-y-2">
              <h3 className="font-bold text-stone-900 text-sm">
                2. Hébergement & Réglementation du livre
              </h3>
              <p>
                <strong>Hébergement du site vitrine :</strong> GitHub Pages — GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis.
              </p>
              <p>
                <strong>Prix unique du livre (Loi Lang) :</strong> Conformément à la loi n° 81-766 du 10 août 1981 relative au prix du livre, le prix des ouvrages papier neufs est fixé par l'éditeur.
              </p>
              <p>
                <strong>Domiciliation bancaire :</strong> {AUTHOR_INFO.bankAffiliation}.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenCgv}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B1E2D] hover:text-[#721824] underline underline-offset-4 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Consulter les Conditions Générales de Vente (CGV)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#8B1E2D]" />
              <span>3. Propriété intellectuelle et droits d'auteur</span>
            </h3>
            <p>
              L'ensemble des contenus présents sur ce site (textes, retraductions, extraits d'ouvrages, cartes topographiques, schémas tactiques, couvertures et analyses) est protégé par le Code de la propriété intellectuelle et demeure la propriété exclusive de Monsieur Émile Mourey. Toute reproduction, représentation, adaptation ou diffusion, totale ou partielle, sans autorisation écrite préalable de l'auteur est interdite, sous réserve des courtes citations conformes à l'article L.122-5 du Code de la propriété intellectuelle (mention explicite de l'auteur et de la source).
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#8B1E2D]" />
              <span>4. Données personnelles (RGPD) et vie privée</span>
            </h3>
            <p>
              Conformément au Règlement Général sur la Protection des Données (UE 2016/679) et à la loi « Informatique et Libertés », les données éventuellement saisies par l'utilisateur (formulaire de contact, coordonnées de livraison ou suivi de commande lorsque les ventes sont ouvertes) ne sont utilisées que pour la finalité strictement demandée. Elles ne sont jamais vendues ni cédées à des tiers. Vous disposez à tout moment d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données en écrivant à <strong>{AUTHOR_INFO.contactEmail}</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Liens de navigation en bas de page */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          type="button"
          onClick={onNavigateMethod}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-semibold text-xs rounded-md transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4 text-[#8B1E2D]" />
          <span>Découvrir « Méthode et Controverse »</span>
        </button>

        <button
          type="button"
          onClick={onNavigateCatalog}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1E2D] hover:bg-[#721824] text-white font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <span>Retour au catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

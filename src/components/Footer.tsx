import React from 'react';
import { AUTHOR_INFO } from '../data/initialData';
import { ShieldCheck, Truck, CreditCard, Lock, Mail } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (type: 'mentions' | 'cgv' | 'shipping_info') => void;
  onNavigateAdmin: () => void;
  onNavigateAuthor: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onNavigateAdmin,
  onNavigateAuthor
}) => {
  return (
    <footer className="bg-[#241712] text-stone-300 border-t border-stone-800 mt-20 text-xs">
      {/* Trust Badges Strip */}
      <div className="border-b border-stone-800/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-stone-800 rounded text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block text-sm font-serif-display">
                Vente Directe Auteur
              </strong>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Auto-édition indépendante · Dédicace personnalisée manuscrite offerte
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-stone-800 rounded text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block text-sm font-serif-display">
                La Poste Colissimo & Relais
              </strong>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Expédition soignée sous 48h · Suivi en temps réel · Franco dès 55 €
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-stone-800 rounded text-amber-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block text-sm font-serif-display">
                Paiement Sécurisé Multicanal
              </strong>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Carte bancaire (Stripe 3DS), PayPal & Chèque (La Banque Postale)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-stone-800 rounded text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block text-sm font-serif-display">
                Légal & Conforme
              </strong>
              <p className="text-stone-400 text-[11px] mt-0.5">
                SIREN {AUTHOR_INFO.siren} · Loi Lang (prix unique du livre) · SAV dédié
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3">
            <h3 className="font-serif-display text-xl font-bold text-white">
              Éditions Émile Mourey
            </h3>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Ouvrages d'histoire, topographie antique et recherches archéologiques en Bourgogne et Gaule centrale. Auto-édité et publié par l'auteur.
            </p>
            <p className="text-stone-500 text-[10px] font-mono">
              SIREN : {AUTHOR_INFO.siren} · {AUTHOR_INFO.activityCode}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <h4 className="font-cinzel text-xs uppercase tracking-wider text-amber-400 font-bold">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-stone-300">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-white transition-colors"
                >
                  Catalogue des livres
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateAuthor}
                  className="hover:text-white transition-colors"
                >
                  Biographie & Travaux d'Émile Mourey
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('shipping_info')}
                  className="hover:text-white transition-colors"
                >
                  Tarifs de livraison & Moyens de paiement
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory */}
          <div className="space-y-2">
            <h4 className="font-cinzel text-xs uppercase tracking-wider text-amber-400 font-bold">
              Réglementation & Droit
            </h4>
            <ul className="space-y-1.5 text-stone-300">
              <li>
                <button
                  onClick={() => onOpenLegal('mentions')}
                  className="hover:text-white transition-colors"
                >
                  Mentions Légales (SIREN 418 122 883)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('cgv')}
                  className="hover:text-white transition-colors"
                >
                  Conditions Générales de Vente (CGV)
                </button>
              </li>
              <li>
                <span className="text-stone-500 text-[11px]">
                  TVA non applicable (art. 293 B du CGI)
                </span>
              </li>
              <li>
                <span className="text-stone-500 text-[11px]">
                  Loi Lang du 10 août 1981
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Domiciliation & Author Access */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-xs uppercase tracking-wider text-amber-400 font-bold">
              Domiciliation & Contact
            </h4>
            <p className="text-stone-400 text-[11px]">
              {AUTHOR_INFO.name}<br />
              {AUTHOR_INFO.postalAddress}
            </p>
            <p className="text-stone-400 text-[11px]">
              Banque : {AUTHOR_INFO.bankAffiliation}
            </p>

            <div className="pt-2">
              <button
                onClick={onNavigateAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[11px] font-medium transition-colors border border-stone-700"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Accès Espace Auteur (Gestion)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-3">
          <p>© {new Date().getFullYear()} Éditions Émile Mourey. Tous droits réservés.</p>
          <p className="text-stone-500">
            Plateforme e-commerce sur mesure · Paiements sécurisés Stripe & PayPal · La Banque Postale
          </p>
        </div>
      </div>
    </footer>
  );
};

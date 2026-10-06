import React from 'react';
import { AUTHOR_INFO } from '../data/initialData';
import { X, ShieldCheck, FileText, Truck, CreditCard } from 'lucide-react';

interface LegalModalProps {
  type: 'mentions' | 'cgv' | 'shipping_info' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF8F5] w-full max-w-3xl rounded-lg shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-[#F5F1E9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'mentions' && <ShieldCheck className="w-5 h-5 text-[#8B1E2D]" />}
            {type === 'cgv' && <FileText className="w-5 h-5 text-[#8B1E2D]" />}
            {type === 'shipping_info' && <Truck className="w-5 h-5 text-[#8B1E2D]" />}
            <h3 className="font-serif-display font-bold text-lg text-[#2B1810]">
              {type === 'mentions' && 'Mentions Légales & Informations Réglementaires'}
              {type === 'cgv' && 'Conditions Générales de Vente (CGV)'}
              {type === 'shipping_info' && 'Guide de Livraison & Moyens de Paiement'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-500 hover:text-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs text-stone-700 space-y-4 leading-relaxed text-justify">
          {type === 'mentions' && (
            <>
              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">1. Éditeur de la publication et du site</h4>
                <p>
                  Le présent site est édité et exploité par <strong>Monsieur Émile Mourey</strong>, auteur, historien et éditeur individuel.
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li><strong>Forme juridique :</strong> Entrepreneur individuel (Micro-entreprise d'auto-édition)</li>
                  <li><strong>Numéro SIREN :</strong> {AUTHOR_INFO.siren}</li>
                  <li><strong>Code APE / NAF :</strong> {AUTHOR_INFO.activityCode}</li>
                  <li><strong>Statut d'immatriculation :</strong> {AUTHOR_INFO.registrationStatus}</li>
                  <li><strong>Régime fiscal :</strong> {AUTHOR_INFO.tvaStatus}</li>
                  <li><strong>Domiciliation bancaire :</strong> {AUTHOR_INFO.bankAffiliation}</li>
                  <li><strong>Siège et adresse postale :</strong> {AUTHOR_INFO.postalAddress}</li>
                  <li><strong>Contact électronique :</strong> {AUTHOR_INFO.contactEmail}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">2. Propriété intellectuelle & Droits d'auteur</h4>
                <p>
                  L'ensemble des textes, extraits d'ouvrages, relevés topographiques, croquis cartographiques et analyses historiques contenus sur ce site sont la propriété exclusive de Monsieur Émile Mourey en vertu du Code de la propriété intellectuelle. Toute reproduction, représentation ou diffusion, même partielle, sans autorisation préalable écrite de l'auteur est formellement interdite.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">3. Données personnelles (RGPD)</h4>
                <p>
                  Les données nominatives recueillies lors de la passation de commande (nom, adresse de livraison, email, téléphone) sont strictement réservées à l'exécution de la commande, à la livraison postale par La Poste Colissimo et à la facturation. Elles ne sont en aucun cas cédées ou vendues à des tiers. Conformément à la loi « Informatique et Libertés », vous disposez d'un droit d'accès et de rectification de vos données.
                </p>
              </div>
            </>
          )}

          {type === 'cgv' && (
            <>
              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">Article 1 : Champ d'application</h4>
                <p>
                  Les présentes Conditions Générales de Vente régissent la vente d'ouvrages historiques publiés en auto-édition par Monsieur Émile Mourey aux lecteurs acheteurs particuliers sur la présente boutique en ligne.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">Article 2 : Prix unique du livre (Loi Lang)</h4>
                <p>
                  Conformément à la Loi n° 81-766 du 10 août 1981 relative au prix du livre (Loi Lang), les prix des livres neufs sont fixés par l'éditeur et s'imposent à tous. Les prix sont indiqués en euros toutes taxes comprises (TVA non applicable selon l'article 293 B du Code Général des Impôts).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">Article 3 : Dédicaces personnalisées</h4>
                <p>
                  L'auteur offre gratuitement sur simple demande lors de la commande une dédicace manuscrite personnalisée. Les ouvrages dédicacés à la demande expresse de l'acheteur restent couverts par la garantie de conformité en cas de détérioration lors de l'acheminement.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">Article 4 : Modalités de paiement</h4>
                <p>
                  Le règlement des commandes s'effectue au choix de l'acheteur :
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li><strong>Par Carte Bancaire sécurisée :</strong> Traitement immédiat via l'infrastructure Stripe avec protocole 3D Secure.</li>
                  <li><strong>Par PayPal :</strong> Débit immédiat sur le compte PayPal de l'acheteur ou carte bancaire via PayPal.</li>
                  <li><strong>Par Chèque bancaire ou postal (La Banque Postale) :</strong> Établi à l'ordre de Monsieur Émile Mourey. La commande est réservée et expédiée dès encaissement du chèque.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">Article 5 : Livraison et Délais</h4>
                <p>
                  Les commandes sont préparées sous 24 à 48 heures ouvrées par l'auteur et expédiées par les services de La Poste en Colissimo suivi ou en Point Relais Pickup. Les frais d'envoi sont offerts à partir de 55,00 € d'achat. Le numéro de suivi permet de suivre l'acheminement en temps réel dans l'Espace Client.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">Article 6 : Droit de rétractation et SAV</h4>
                <p>
                  L'acheteur dispose d'un délai légal de 14 jours francs à compter de la réception du colis pour exercer son droit de rétractation pour les livres papier. En cas de colis endommagé ou de problème de livraison, un outil de réclamation SAV est disponible directement sur chaque commande dans l'Espace Client pour un règlement amiable immédiat avec l'auteur.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">Article 7 : Ouvrages Numériques (eBooks & Fichiers PDF)</h4>
                <p>
                  Les versions numériques complètes des ouvrages (fichiers PDF) sont protégées par le droit d'auteur. Aucun accès gratuit n'est autorisé pour l'intégralité des œuvres numériques. L'accès au téléchargement sécurisé et à la liseuse en ligne nécessite impérativement une commande préalable validée via le panier. Dès encaissement effectif du paiement par carte bancaire, PayPal ou validation du chèque par l'auteur, les fichiers PDF officiels sont débloqués dans l'Espace Client du compte acheteur pour un usage personnel et non transférable. Conformément à l'article L.221-28 13° du Code de la consommation, le droit de rétractation ne peut être exercé pour les contenus numériques immatériels dont l'exécution a débuté après accord de l'acheteur.
                </p>
              </div>
            </>
          )}

          {type === 'shipping_info' && (
            <>
              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">Modes d'Expédition</h4>
                <p>
                  Tous nos colis sont emballés avec le plus grand soin sous cartonnage renforcé afin de préserver l'intégrité des livres brochés et de leurs cartes topographiques :
                </p>
                <div className="space-y-2 mt-2">
                  <div className="p-3 bg-stone-100 rounded">
                    <strong>Colissimo Domicile (sans signature) :</strong> Remis directement dans votre boîte aux lettres normalisée sous 48h. Frais calculés selon le poids (à partir de 4,95 €). Offert dès 55 € d'achat.
                  </div>
                  <div className="p-3 bg-stone-100 rounded">
                    <strong>Colissimo Recommandé avec signature :</strong> Remise en mains propres contre signature avec assurance complète perte et avarie.
                  </div>
                  <div className="p-3 bg-stone-100 rounded">
                    <strong>Point Relais (La Poste Pickup / Mondial Relay) :</strong> Retrait chez votre commerçant de proximité sous 3 à 4 jours ouvrés (3,90 € ou offert dès 55 €).
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">Sécurité des Règlements</h4>
                <p>
                  Nos paiements sont 100 % sécurisés sans conservation de coordonnées bancaires sur le serveur :
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li><strong>Cartes Bancaires :</strong> Chiffrement SSL 256 bits via Stripe.</li>
                  <li><strong>PayPal :</strong> Protection des achats PayPal intégrée.</li>
                  <li><strong>Chèque postal :</strong> Domiciliation officielle à La Banque Postale au nom de Monsieur Émile Mourey.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

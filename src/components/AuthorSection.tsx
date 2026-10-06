import React, { useState } from 'react';
import { AUTHOR_INFO } from '../data/initialData';
import { Feather, BookOpen, MapPin, Send, CheckCircle, ShieldCheck, Award } from 'lucide-react';

export const AuthorSection: React.FC = () => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim()) return;
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Presentation */}
      <div className="border border-stone-200 rounded-lg p-8 sm:p-10 bg-white shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Author insignia and portrait card */}
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-lg bg-[#2B1810] border-4 border-[#D4AF37]/40 shadow-xl flex flex-col items-center justify-center p-4 text-[#D4AF37] relative overflow-hidden">
              <div className="absolute inset-1 border border-current opacity-30 rounded pointer-events-none" />
              <Feather className="w-12 h-12 text-[#D4AF37] mb-2 opacity-90 stroke-[1.5]" />
              <p className="font-cinzel text-xs uppercase tracking-[0.2em] font-bold text-white">
                Émile Mourey
              </p>
              <p className="font-serif-display italic text-xs text-amber-200/80 mt-1">
                Auteur & Historien
              </p>
              <p className="text-[10px] text-white/50 tracking-wider mt-3">
                Bourgogne · Saône-et-Loire
              </p>
            </div>

            <div className="mt-4 text-xs text-stone-500 space-y-1">
              <p className="font-semibold text-stone-800">Monsieur Émile Mourey</p>
              <p>Entreprise Individuelle d'Édition</p>
              <p className="font-mono text-[11px]">SIREN 418 122 883</p>
              <p>Banque : {AUTHOR_INFO.bankAffiliation}</p>
            </div>
          </div>

          {/* Biography & Mission */}
          <div className="md:col-span-8 space-y-4">
            <span className="font-cinzel text-xs uppercase tracking-widest text-[#8B1E2D] font-bold">
              Biographie & Démarche de Recherche
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2B1810]">
              L'Histoire révélée par la topographie du terrain
            </h2>
            <div className="space-y-3 text-sm text-stone-700 leading-relaxed text-justify">
              <p>
                Chercheur indépendant passionné par les civilisations celtique et gallo-romaine, <strong>Émile Mourey</strong> consacre ses travaux à la confrontation minutieuse des textes classiques (les <em>Commentaires sur la Guerre des Gaules</em> de Jules César, Dion Cassius, Strabon) avec la réalité physique des terroirs bourguignons.
              </p>
              <p>
                Refusant les idées reçues et les reconstructions arbitraires du XIXe siècle sous Napoléon III, il a arpenté pendant des décennies les collines, les combes et les confluents des rivières de Saône-et-Loire, du Morvan et de la Côte-d'Or. Ses thèses sur la localisation de <strong>Bibracte au Mont Saint-Vincent</strong> et sur la véritable configuration du siège d'<strong>Alésia</strong> ont suscité un vif intérêt parmi les passionnés et les érudits.
              </p>
              <p>
                En choisissant l'<strong>auto-édition</strong>, l'auteur garantit l'indépendance intégrale de ses recherches, la richesse de son appareil cartographique et un lien direct, sans intermédiaire, avec ses lecteurs.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-600">
              <span className="flex items-center gap-1.5 font-medium text-stone-800">
                <Award className="w-4 h-4 text-[#8B1E2D]" /> Plus de 7 ouvrages majeurs publiés
              </span>
              <span className="flex items-center gap-1.5 font-medium text-stone-800">
                <MapPin className="w-4 h-4 text-[#8B1E2D]" /> Enracinement en Bourgogne
              </span>
              <span className="flex items-center gap-1.5 font-medium text-stone-800">
                <Feather className="w-4 h-4 text-[#8B1E2D]" /> Dédicace personnalisée sur demande
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Thematic Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FAF8F5] p-6 rounded-lg border border-stone-200 space-y-2">
          <span className="font-cinzel text-xs text-[#8B1E2D] font-bold block">01. Histoire de Bibracte</span>
          <h3 className="font-serif-display font-bold text-lg text-stone-900">
            Le Mont Saint-Vincent
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed text-justify">
            Une tétralogie monumentale (Tomes 2 à 5) retraçant l'épopée de la métropole éduenne, du Bouclier Éduen à l'Épée Flamboyante, et des cultes solaires de Dieu Rayonnant aux secrets de Dieu Caché.
          </p>
        </div>

        <div className="bg-[#FAF8F5] p-6 rounded-lg border border-stone-200 space-y-2">
          <span className="font-cinzel text-xs text-[#8B1E2D] font-bold block">02. Histoire de Gergovie</span>
          <h3 className="font-serif-display font-bold text-lg text-stone-900">
            L'Épreuve du Terrain
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed text-justify">
            Une relecture rigoureuse des Commentaires de César confrontée aux distances militaires romaines, à l'élévation des deux camps et à la manœuvre de diversion des cavaliers de Vercingétorix.
          </p>
        </div>

        <div className="bg-[#FAF8F5] p-6 rounded-lg border border-stone-200 space-y-2">
          <span className="font-cinzel text-xs text-[#8B1E2D] font-bold block">03. Histoire du Christ</span>
          <h3 className="font-serif-display font-bold text-lg text-stone-900">
            Enquête Historique
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed text-justify">
            Un diptyque fouillé confrontant les sources évangéliques au droit pénal romain sous Ponce Pilate (Tome 1) et retraçant la diffusion gallo-romaine le long des fleuves jusqu'en Bourgogne (Tome 2).
          </p>
        </div>
      </div>

      {/* Contact Form for Author */}
      <div className="bg-white border border-stone-200 rounded-lg p-8 space-y-6">
        <div className="border-b border-stone-200 pb-4">
          <h3 className="font-serif-display font-bold text-xl text-[#2B1810]">
            Écrire à Monsieur Émile Mourey
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Pour une question historique, une demande de conférence ou une commande spécifique pour une bibliothèque ou association.
          </p>
        </div>

        {sentSuccess ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Votre message a bien été transmis à Monsieur Émile Mourey. Il vous répondra par courrier électronique dans les plus brefs délais.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Votre Nom & Prénom *</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  placeholder="Jean Dupont"
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Votre Adresse Email *</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  placeholder="votre.email@exemple.fr"
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Votre Message à l'Auteur *</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                rows={5}
                placeholder="Monsieur Mourey, je souhaiterais échanger avec vous au sujet de..."
                className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-1 focus:ring-[#8B1E2D]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B1E2D] hover:bg-[#721824] text-white font-semibold rounded shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer mon message</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

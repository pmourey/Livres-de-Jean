# Système d'Authentification Cloudflare & Séparation Espace Client / Back-Office Auteur

Étude d'architecture et plan de mise en œuvre pour sécuriser l'accès aux commandes et téléchargements numériques via des jetons Cloudflare D1 sans mot de passe (Magic Code OTP), tout en isolant hermétiquement la gestion de l'auteur (back-office) derrière un portail d'administration dédié et protégé.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Décisions validées lors de la phase de cadrage :
> 1. **Fournisseur d'authentification retenu** : Cloudflare Worker + Base SQL D1 + jetons cryptographiques HMAC SHA-256 (hébergement souverain, synchronisé avec le Worker et le stockage R2 existants, sans dépendance externe à Firebase).
> 2. **Séparation des espaces** : Cloisonnement strict en deux portails distincts avec contrôle d'accès par rôle (Espace Client `/mon-compte` accessible aux acheteurs vs Back-Office Auteur `/admin` verrouillé par code d'accès administrateur et session signée).
> 3. **Expérience d'authentification client** : Connexion sans mot de passe par code à usage unique (Magic Code OTP à 6 chiffres) envoyé par email ou validé par signature de commande, éliminant les pertes de mot de passe pour les lecteurs d'ouvrages historiques.

---

### 1. Overview & Core Concept

- **Ce que fait le système** :
  - **Pour les lecteurs / clients** : Permet de se connecter en saisissant simplement son adresse email. Un code de sécurité temporaire à 6 chiffres (valide 15 minutes) permet de générer un jeton de session `customerToken` signé HMAC. Une fois connecté, le client accède à son tableau de bord personnalisé : historique de ses commandes réelles dans D1, streaming/téléchargement direct des eBooks PDF acquis, et messagerie SAV dédiée.
  - **Pour l'auteur (Émile Mourey & gestionnaires)** : Isole entièrement le panneau d'administration des commandes, gestion des stocks, validation des chèques et réclamations dans une vue dédiée (`/admin`), protégée par un écran de verrouillage exigeant la clé secrète auteur (`ADMIN_SECRET`). Les visiteurs du catalogue ne peuvent plus accéder par hasard ou indiscrétion aux données de vente ou de facturation.
- **Public cible & Personas** :
  - *Lecteurs & acheteurs d'histoire* : Souhaitent une consultation fluide de leurs commandes et de leurs téléchargements PDF sans friction de mot de passe complexe à retenir.
  - *Auteur / Administrateur* : Nécessite un environnement confidentiel, ergonomique et sécurisé pour gérer les stocks de livres papier, les paiements par chèque bancaire, l'édition des bordereaux et factures.
- **Bénéfice clé** : Sécurité renforcée, conformité RGPD (étanchéité des données clients et exclusion de l'accès public au back-office), et continuité totale avec l'infrastructure Cloudflare (Worker + D1 + R2) déjà déployée.

---

### 2. User Experience & Visual Design

#### Parcours Utilisateurs Clés

1. **Parcours Connexion Client (Espace Lecteur)** :
   - Clic sur "Espace Client" dans la barre de navigation.
   - Si non connecté : Écran épuré invitant à renseigner son email d'achat (`philippe.mourey@gmail.com`).
   - Clic sur "Recevoir mon code d'accès" : appel à `/api/auth/request-code`.
   - Affichage immédiat d'un champ de saisie du code OTP à 6 chiffres avec compte à rebours de validité (15 min) et bouton de renvoi.
   - Validation du code : génération du jeton cryptographique `customerToken`, stockage sécurisé en session et redirection vers le tableau de bord avec ses commandes réelles et ses eBooks PDF débloqués.

2. **Parcours Espace Auteur (Back-Office)** :
   - Clic sur "Gestion Auteur" ou navigation vers le mode admin.
   - Si non authentifié en tant qu'auteur : Écran de sécurité solennel (style sceau éditorial & coffre-fort), avec saisie du mot de passe maître / clé secrète auteur.
   - Après validation auprès du Worker (`/api/admin/auth`) : génération d'un jeton administrateur `adminToken`, ouvrant le tableau de bord complet (commandes, gestion des stocks, chèques, réclamations, factures, bordereaux Colissimo).
   - Possibilité de déconnexion immédiate en 1 clic ("Verrouiller l'espace auteur").

#### Identité Visuelle & Thème

Conformément à la charte typographique et patrimoniale des **Éditions Émile Mourey** et aux directives `frontend-design` :
- **Atmosphère & Couleurs** :
  - Fond dominant neutre : Toile parcheminée claire (`#FAF8F5`) et ardoise claire structurée.
  - Surfaces structurelles : Cartes blanches avec bordure hairline subtile (`border-stone-200 / border-[#E7E2D9]`), suppression de tout effet pill ou dégradé fluo.
  - Accents d'action : Rouge carmin grand siècle (`#8B1E2D` / hover `#721824`) pour les validations et boutons d'action majeurs.
  - Teinte de sécurité administrateur : Anthracite noble (`#1C1917` / `#292524`) avec typographie dorée/bronze discrète (`#B45309`), évoquant un sceau d'archives privées.
- **Typographie** :
  - Titres et marques : *Cinzel* et *Serif Display* pour la noblesse éditoriale.
  - Données chiffrées & codes OTP : Police monospace à espacement tabulaire (`tabular-nums font-mono`) pour la lisibilité irréprochable des montants et numéros de suivi.
- **Règles d'ergonomie & Anti-Slop** :
  - Métadonnées sans pilules décoratives (séparateurs naturels `·`).
  - Aucun badge gadget ou mention superflue.
  - Tous les boutons ont des gestionnaires d'événements fonctionnels.

---

### 3. Key Product Decisions & Trade-Offs

#### Décision 1 : Cloudflare D1 + Jetons HMAC vs Firebase Auth
- **Approche retenue** : Utiliser la base de données SQL Cloudflare D1 et les fonctions de signature cryptographique HMAC SHA-256 du Worker (`/src/worker.ts`), déjà couplées aux paiements Stripe/PayPal et au stockage R2.
- **Pourquoi** :
  - Évite d'ajouter une seconde couche d'infrastructure et un compte Google Firebase externe.
  - Élimine les dépendances clientes lourdes (SDK Firebase).
  - Unifie la persistance des commandes, des clients et des droits numériques dans une seule base D1 relationnelle.
- **Alternative écartée** : Firebase Authentication (écartée conformément au choix utilisateur, évitant la dispersion des données entre Google Cloud et Cloudflare).

#### Décision 2 : Connexion sans mot de passe (Magic Code OTP) pour les lecteurs
- **Approche retenue** : Le client reçoit un code à 6 chiffres temporaire (ou vérification instantanée si commande test avec signature).
- **Pourquoi** :
  - Évite le syndrome du mot de passe oublié chez les lecteurs occasionnels.
  - Sécurité optimale : le code expire au bout de 15 minutes et n'est utilisable qu'une seule fois.
  - Compatible avec l'envoi d'emails transactionnels (SendGrid / Worker MailChannels).
- **Alternative écartée** : Mot de passe persistant stocké avec hash bcrypt (plus complexe à gérer et source d'abandons pour les clients d'eCommerce).

#### Décision 3 : Cloisonnement strict Espace Client / Espace Auteur
- **Approche retenue** : Deux sous-arborescences étanches au niveau du routeur et de l'état de l'application :
  - `CustomerDashboard` : ne charge ni n'affiche jamais les fonctions de réapprovisionnement de stock, ni les commandes des autres clients, ni les validations de chèques d'autrui.
  - `AdminDashboard` : conditionné par la vérification d'un `adminToken` validé par le Worker Cloudflare via le secret d'administration (`ADMIN_SECRET`).
- **Pourquoi** : Confidentialité totale des ventes, des marges et des adresses postales de tiers.

---

### 4. Technical Architecture & Data Strategy

#### Architecture du Système & Flux de Données

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Navigateur Client (React SPA)                   │
├───────────────────────────────────┬────────────────────────────────────┤
│           Espace Lecteur          │        Back-Office Auteur          │
│   (Vue: 'account' / /mon-compte)   │       (Vue: 'admin' / /admin)      │
│  - Formulaire Code Magique OTP    │  - Écran de déverrouillage Auteur  │
│  - Consultation commandes D1      │  - Gestion globale des stocks      │
│  - Téléchargements sécurisés R2   │  - Validation chèques & virements  │
│  - Messagerie SAV commandes       │  - Traitement des commandes / BL   │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  │ Bearer customerToken               │ Bearer adminToken
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Cloudflare Worker (livres-de-jean-payments)              │
├────────────────────────────────────────────────────────────────────────┤
│ Endpoints Publics & Auth Client :                                      │
│  • POST /api/auth/request-code    -> Génère un code OTP dans D1        │
│  • POST /api/auth/verify-code     -> Valide l'OTP et délivre le token  │
│  • GET  /api/account/orders       -> Commandes du client authentifié   │
│  • GET  /api/download/:cmd/:book  -> Téléchargement R2 vérifié         │
│                                                                        │
│ Endpoints Privés Auteur :                                              │
│  • POST /api/admin/auth           -> Vérifie ADMIN_SECRET et signe     │
│  • GET  /api/admin/orders         -> Liste intégrale des commandes D1   │
│  • POST /api/admin/orders/:id     -> Changement statut / suivi colis   │
│  • POST /api/admin/stock          -> Mise à jour des exemplaires       │
└─────────────────┬────────────────────────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│       Cloudflare D1 (SQL)         │ │        Cloudflare R2 (PDFs)      │
│ - customers (id, email, nom...)   │ │ - ebooks-jean/                   │
│ - orders (id, customer_id, json)  │ │   • mourey-gergovie-tome-1.pdf   │
│ - auth_codes (email, code, exp)   │ │   • mourey-bibracte-tome-1.pdf   │
│ - admin_sessions (token, exp)     │ │ - customer-pdfs/                 │
└───────────────────────────────────┘ └──────────────────────────────────┘
```

#### Schéma SQL Cloudflare D1 Complémentaire

Pour compléter les tables existantes (`customers`, `orders`) dans `src/worker.ts` :

```sql
-- Table des codes de connexion temporaires pour l'Espace Client
CREATE TABLE IF NOT EXISTS auth_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des sessions administrateur actives
CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
```

#### Plan de Découpage des Étapes d'Implémentation

1. **Étape 1 : Extension du Worker Cloudflare (`src/worker.ts`)**
   - Implémentation des routes d'authentification client :
     - `POST /api/auth/request-code` : génère un code OTP à 6 chiffres, l'enregistre dans D1 avec expiration à 15 minutes (et envoie l'email si SendGrid est configuré, ou renvoie en mode développement).
     - `POST /api/auth/verify-code` : vérifie le code et signe un `customerToken` HMAC.
   - Implémentation des routes de gestion auteur :
     - `POST /api/admin/auth` : compare le mot de passe auteur avec `ADMIN_SECRET` et génère un jeton signé `adminToken`.
     - Middleware de validation `adminToken` sur toutes les routes d'administration.

2. **Étape 2 : Sécurisation & Étanchéité de l'Espace Auteur (`src/components/AdminDashboard.tsx`)**
   - Ajout d'une barrière d'authentification (`AdminLoginLock`) avant d'afficher le panneau de gestion.
   - Persistance du jeton `adminToken` en `sessionStorage` (avec expiration automatique pour ne pas laisser le back-office ouvert sur un poste partagé).
   - Bouton de verrouillage / déconnexion en haut à droite du tableau de bord d'administration.

3. **Étape 3 : Refonte de la Connexion de l'Espace Client (`src/components/CustomerDashboard.tsx`)**
   - Remplacement de la simple saisie d'email par le flux complet en deux temps : saisie email -> saisie du code OTP reçu.
   - Bouton d'accès rapide pour les commandes de test locales déjà validées (compatibilité avec `CMD-2026-0389`, `CMD-2026-0181`, `CMD-2026-0970`).
   - Affichage clair du profil lecteur authentifié avec indicateur de session sécurisée.

4. **Étape 4 : Mise à jour de la Navigation Principale (`src/components/Header.tsx` et `src/App.tsx`)**
   - Mise à jour des liens du Header :
     - "Espace Client" mène à l'espace lecteur sécurisé.
     - "Gestion Auteur" est accessible soit via un lien discret en pied de page / coin discret du bandeau avec icône cadenas, soit via la route dédiée `/admin`.
   - Synchronisation de l'état global et nettoyage des permissions.

5. **Étape 5 : Tests de validation & Compilation**
   - Vérification du build TypeScript (`compile_applet`).
   - Tests automatisés (`npm test`) pour valider la non-régression des flux existants (achats, panier, calculs de frais de port et vérification des droits numériques).

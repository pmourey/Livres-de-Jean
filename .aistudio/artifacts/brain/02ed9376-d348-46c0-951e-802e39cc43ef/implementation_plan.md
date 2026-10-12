# Résolution des Téléchargements via Cloudflare R2 Exclusif, Synchronisation D1, Protection des Manuscrits & Liens Amazon Kindle

Ce plan détaille la mise en œuvre d'une architecture de téléchargement sécurisée s'appuyant **exclusivement sur Cloudflare R2** (sans recours ni redirection vers Google Drive), la correction du Worker pour la vérification des commandes dans Cloudflare D1, la protection des manuscrits inédits contre les risques de copie, et l'intégration des fiches d'achat Amazon Kindle avec identifiant ASIN direct.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Décisions et ajustements confirmés :**
> - **Stockage & Distribution des PDF (R2 Uniquement)** : Aucun lien ni redirection vers Google Drive. Le téléchargement s'effectue exclusivement depuis le bucket de stockage **Cloudflare R2** (`env.BUCKET` ou URL signée R2). Le Cloudflare Worker vérifie la commande dans la base D1, puis extrait et sert le flux binaire PDF directement depuis R2 avec les en-têtes sécurisés `Content-Disposition: attachment` et `Content-Type: application/pdf`.
> - **Politique Droits d'Auteur pour les Manuscrits Inédits** : Maintien de l'achat de fichiers PDF téléchargeables uniquement pour les ouvrages officiellement publiés (disposant d'un ISBN / dépôt légal). Les manuscrits inédits restent réservés au mode de consultation d'extraits protégé en ligne et à la commande papier reliée ou lien Kindle officiel, protégeant l'antériorité de l'œuvre et interdisant la dissémination de PDF bruts non protégés.
> - **Format Kindle Amazon** : Ajout des liens directs vers les fiches produits Amazon Kindle intégrant le champ ASIN pour chaque livre (avec fallback de recherche guidée si l'ASIN n'est pas encore renseigné).

---

### 1. Overview & Core Concept

- **Problème résolu** : 
  1. Lors du clic sur `https://livres-de-jean-payments.super-violet-dc40.workers.dev/api/download/CMD-2026-0844/mourey-gergovie-tome-1?email=...`, le Worker Cloudflare renvoyait `{"error":"Order not found"}` en raison d'un décalage d'index dans le routeur et de l'absence de commande dans la table D1 `orders`.
  2. Vous souhaitez que tous les téléchargements de PDF transitent **exclusivement par Cloudflare R2**, sans dépendre de Google Drive.
  3. Les manuscrits inédits nécessitent une protection juridique stricte pour ne pas être exposés au piratage par des PDF téléchargeables ouverts.
  4. L'accès rapide au catalogue Kindle Amazon avec identifiant ASIN direct manquait pour les lecteurs sur liseuses.

- **Solution apportée** :
  - **Routeur Cloudflare Worker (`src/worker.ts`) & R2 Exclusif** :
    - Correction de l'extraction des paramètres d'URL (`orderId` = `CMD-2026-0844`, `bookId` = `mourey-gergovie-tome-1`).
    - Contrôle d'accès strict via D1 (`orders` et correspondance avec l'email acheteur).
    - Récupération du fichier PDF directement dans le bucket Cloudflare R2 (`await env.BUCKET.get(r2Key)`) et transmission directe du fichier au navigateur avec en-têtes anti-mise en cache et nom de fichier soigné (`Content-Disposition: attachment; filename="..."`).
  - **Synchronisation automatique des commandes dans D1** :
    - Toute commande validée (Stripe, PayPal, virement) est synchronisée vers le Worker D1 (`POST /api/account/orders`).
    - Enregistrement immédiat dans la base SQLite locale/D1 pour permettre le téléchargement instantané et persistant.
  - **Protection des Droits d'Auteur pour Manuscrits Inédits** :
    - Les manuscrits ne proposent pas de vente de PDF brut téléchargeable.
    - Accès offert : consultation d'extraits protégée dans le visualiseur avec filigrane, commande d'exemplaires papier reliés, ou lien vers l'édition Kindle KDP.
  - **Intégration Amazon Kindle** :
    - Ajout des champs `kindleAsin` et `kindleUrl` au modèle `Book`.
    - Bouton d'achat Kindle direct dans les fiches catalogue, les modales et l'administration.

---

### 2. User Experience & Visual Design

- **Fiche Livre & Catalogue** :
  - Typographie littéraire épurée avec séparateurs textuels légers `·` (zéro pilule visuelle superflue).
  - Ouvrages publiés : options d'achat Broché papier, E-Book PDF téléchargeable (servi par R2), et bouton direct « Format Kindle » (pointant vers Amazon).
  - Manuscrits inédits : badge informatif discret « Manuscrit d'auteur — Consultation & Tirage d'art », bouton « Consulter les extraits » protégé, et lien Kindle si disponible.
- **Téléchargement & Confirmation Client** :
  - Sur l'écran de confirmation et dans l'espace client « Mes e-Books », le lien généré appelle l'API R2 : `GET /api/download/:orderId/:bookId?email=...`.
  - Le navigateur déclenche un téléchargement immédiat et propre du fichier PDF d'origine depuis Cloudflare R2, sans redirection externe vers Google Drive.
- **Administration** :
  - Formulaire de gestion des livres mis à jour pour renseigner l'ASIN Kindle (`kindleAsin`, ex: `B0D...`) et la clé R2 (`r2Key` ou `pdfFileName`).

---

### 3. Key Product Decisions & Trade-Offs

- **Décision 1 : R2 Exclusif (sans Google Drive)**
  - *Approche* : Le Worker utilise la liaison native Cloudflare R2 (`BUCKET`). Le fichier est récupéré par `await env.BUCKET.get(key)` et renvoyé sous forme de flux binaire avec `headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="nom-du-livre.pdf"' }`.
  - *Raison* : Sécurité maximale, aucun lien public Google Drive exposé, contrôle total des quotas et des droits d'accès rattachés à chaque commande client.
- **Décision 2 : Synchronisation des commandes dans Cloudflare D1**
  - *Approche* : Lors de la finalisation d'un achat sur l'application web, la commande est transmise et persistée dans la table SQLite `orders` du Worker via l'API `/api/account/orders`. Le Worker gère également la rétrocompatibilité pour la commande `CMD-2026-0844`.
  - *Raison* : Résolution définitive du message d'erreur `{"error":"Order not found"}`.
- **Décision 3 : Protection des manuscrits inédits**
  - *Approche* : Restriction de la vente de PDF téléchargeable aux seuls ouvrages publiés avec ISBN / dépôt légal. Les manuscrits restent disponibles en lecture d'extraits in-app, en impression papier reliée, ou via Kindle KDP.
  - *Raison* : Préserver la paternité et l'intégrité de l'œuvre inédite de Jean Mourey face au risque de dissémination incontrôlée de fichiers numériques.
- **Décision 4 : Liens directs Amazon Kindle**
  - *Approche* : Génération d'URL directe vers la fiche produit Amazon France à partir de l'ASIN (`https://www.amazon.fr/dp/${asin}`). En l'absence d'ASIN, fallback élégant vers une recherche ciblée sur Amazon.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION CLIENT VITE                       │
│                                                                        │
│  ┌─────────────────────────┐            ┌───────────────────────────┐  │
│  │   BookCard / BookModal  │            │     CustomerDashboard     │  │
│  │  - Lire extraits        │            │  - Mes e-Books achetés    │  │
│  │  - Bouton Kindle (ASIN) │            │  - Liens R2 sécurisés     │  │
│  │  - Achat PDF (si pub.)  │            └─────────────┬─────────────┘  │
│  └───────────┬─────────────┘                          │                │
│              │                                        │                │
│              ▼                                        ▼                │
│  ┌─────────────────────────┐            ┌───────────────────────────┐  │
│  │      CheckoutModal      │───────────▶│  Sync Service (D1 API)    │  │
│  │  - Stripe / PayPal      │  Commande  │  POST /api/account/orders │  │
│  └─────────────────────────┘            └─────────────┬─────────────┘  │
└───────────────────────────────────────────────────────┼────────────────┘
                                                        │ HTTPS
                                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 CLOUDFLARE WORKER (livres-de-jean-payments)            │
│                                                                        │
│   GET /api/download/:orderId/:bookId?email=...                         │
│   ├── 1. Parsing URL corrigé (orderId = CMD-..., bookId = mourey-...)  │
│   ├── 2. Vérification de la commande dans la base D1 (orders)          │
│   └── 3. Récupération directe dans Cloudflare R2 (env.BUCKET.get(key)) │
│                                  │                                     │
│                                  ▼                                     │
│                 ┌─────────────────────────────────┐                    │
│                 │      CLOUDFLARE R2 BUCKET       │                    │
│                 │   (Fichiers PDF originaux)      │                    │
│                 └─────────────────────────────────┘                    │
│                                  │ Flux binaire PDF                    │
│                                  ▼                                     │
│       Réponse HTTP directe 200 (Content-Type: application/pdf)         │
└────────────────────────────────────────────────────────────────────────┘
```

#### Éléments de Données & Schéma :
- **Modèle `Book` (`src/types.ts`)** :
  - `kindleAsin?: string` (Identifiant ASIN, ex: `B0D1234567`)
  - `kindleUrl?: string` (Lien direct alternatif)
  - `r2Key?: string` (Identifiant du fichier dans le bucket R2, ex: `livres/mourey-gergovie-tome-1.pdf`)
  - `isManuscript: boolean` (Indicateur de statut manuscrit vs livre publié)
  - `canBuyPdf: boolean` (`false` pour les manuscrits inédits, `true` pour les livres publiés)
- **Table SQLite D1 (`orders`)** :
  - Mémorise `id`, `customer_email`, `items_json`, `status`, `created_at`.

---

### 5. Plan d'Exécution & Vérifications

1. **Mise à jour du Worker Cloudflare (`src/worker.ts` & `wrangler.toml`)** :
   - Correction du routage `/api/download/:orderId/:bookId`.
   - Remplacement de toute redirection Drive par un streaming sécurisé direct depuis le bucket R2 `env.BUCKET.get(r2Key)`.
   - Ajout d'une commande initiale rétrocompatible pour `CMD-2026-0844` avec `mourey-gergovie-tome-1` associée à votre adresse email pour débloquer immédiatement votre test.
   - Mise à jour du fichier `wrangler.toml` pour déclarer la liaison R2 (`[[r2_buckets]] binding = "BUCKET"`).
2. **Mise à jour du modèle de données (`src/types.ts`, `src/data/initialData.ts`)** :
   - Ajout des champs Kindle (`kindleAsin`, `kindleUrl`) et R2 (`r2Key`).
   - Configuration de la restriction d'achat PDF sur les manuscrits inédits avec promotion du mode lecture d'extraits.
3. **Mise à jour de l'interface utilisateur** :
   - `BookCard.tsx` et `BookDetailModal.tsx` : affichage du bouton d'achat Kindle direct et différenciation claire manuscrit/publié.
   - `CheckoutModal.tsx` et `App.tsx` : synchronisation systématique des commandes avec l'API D1 du Worker.
   - `CustomerDashboard.tsx` : fiabilisation des téléchargements R2.
   - `AdminPanel.tsx` : formulaire d'administration avec saisie de l'ASIN Kindle et clé R2.
4. **Vérification & Compilation** :
   - Exécution de `compile_applet` pour garantir l'absence d'erreurs TypeScript et le bon build Vite.

# Éditions Émile Mourey

Site vitrine et boutique de livres, réalisé avec React, TypeScript et Vite.

## Prérequis

- Node.js 20.19 ou supérieur (ou 22.12 ou supérieur)
- npm
- Git

## Installation et exécution en local

```bash
git clone https://github.com/pmourey/Livres-de-Jean.git
cd Livres-de-Jean
npm ci
npm run dev
```

Le serveur de développement est accessible à l’adresse `http://localhost:3000`.

Pour vérifier la compilation de production et la prévisualiser localement :

```bash
npm run build
npm run preview
```

Le site compilé est généré dans le répertoire `dist/`.

## Déploiement sur GitHub Pages

Le site est statique et peut être hébergé gratuitement sur GitHub Pages à l’adresse `https://pmourey.github.io/Livres-de-Jean/`. Deux méthodes sont possibles ; n’en utiliser qu’une seule à la fois, car la source configurée dans **Settings > Pages** diffère.

### Prérequis commun : chemin de base de Vite

Sur GitHub Pages, le site est servi dans un sous-dossier portant le nom du dépôt. Sans cela, la page s’affiche en blanc. `vite.config.ts` doit donc contenir :

```ts
base: '/Livres-de-Jean/', // nom exact du dépôt
```

Si le dépôt est renommé ou si un domaine personnalisé est utilisé, adapter cette valeur.

### Méthode 1 : déploiement automatique avec GitHub Actions (recommandée)

À chaque `git push` sur `main`, GitHub construit et publie le site.

1. Dans le dépôt GitHub, ouvrir **Settings > Pages**.
2. Dans **Build and deployment > Source**, choisir **GitHub Actions** (et non « Deploy from a branch »). Ignorer les modèles proposés : vous allez créer votre propre workflow.
3. Créer le fichier `.github/workflows/deploy.yaml` (absent actuellement du dépôt) avec le contenu ci-dessous.
4. Envoyer les changements :

   ```bash
   git add .
   git commit -m "Mise à jour du site"
   git push origin main
   ```

5. Suivre l’exécution du workflow **Deploy to GitHub Pages** dans l’onglet **Actions**. Une fois terminé, le site est en ligne.

Contenu du workflow :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ "main" ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
```

Si l’étape **Setup Pages** échoue avec « Get Pages site failed », c’est que la source de Pages n’est pas réglée sur **GitHub Actions** (étape 2).

Le fichier `package-lock.json` doit être versionné et mis à jour (`npm install`) à chaque changement de dépendances, car le workflow utilise `npm ci`. Si la branche principale s’appelle `master`, adapter `branches` dans le workflow.

### Méthode 2 : déploiement manuel avec le paquet `gh-pages`

Le déploiement est lancé depuis votre ordinateur ; le paquet publie le contenu de `dist/` sur une branche `gh-pages`.

1. Installer le paquet (déjà déclaré dans `devDependencies` de ce dépôt ; la commande n’est nécessaire que s’il manque) :

   ```bash
   npm install gh-pages --save-dev
   ```

2. Vérifier que les deux scripts suivants figurent dans la section `"scripts"` de `package.json` (déjà le cas ici) :

   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. Déployer :

   ```bash
   npm run deploy
   ```

   Le site est construit, puis la branche `gh-pages` est créée ou mise à jour sur GitHub.
4. Lors du premier déploiement uniquement, ouvrir **Settings > Pages**, choisir **Deploy from a branch**, puis la branche `gh-pages` (dossier `/ (root)`).

**Important :** si vous avez créé le workflow de la méthode 1, il se lancera à chaque push sur `main` et risque d’échouer ou d’entrer en conflit avec cette méthode. Supprimez `.github/workflows/deploy.yaml` (ou désactivez-le dans l’onglet **Actions**) si vous choisissez la méthode 2.

## Données et configuration

Le site est une application statique : aucune variable d’environnement ni aucun serveur n’est requis pour le déploiement GitHub Pages. Les données de panier, de compte et de commandes sont conservées dans le `localStorage` du navigateur et ne sont pas partagées entre appareils ou utilisateurs.

Les choix de paiement affichés dans l’interface ne constituent pas une intégration de paiement côté serveur. Ne pas utiliser ce déploiement comme une boutique de production pour traiter de vrais paiements ou des données sensibles sans ajouter un backend sécurisé et les intégrations correspondantes. Ne jamais incorporer de clé secrète dans le code client ou dans les fichiers publiés.

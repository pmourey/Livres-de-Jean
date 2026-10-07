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

Le dépôt est configuré pour publier le site sur GitHub Pages avec GitHub Actions. Pour activer le déploiement :

1. Dans le dépôt GitHub, ouvrir **Settings > Pages** et choisir **GitHub Actions** comme source de publication.
2. Envoyer les changements sur la branche `main`.
3. Suivre l’exécution du workflow **Deploy to GitHub Pages** dans l’onglet **Actions**. Une fois terminé, le site sera publié sur `https://pmourey.github.io/Livres-de-Jean/`.

Le workflow `.github/workflows/deploy.yaml` installe les dépendances avec `npm ci`, lance `npm run build`, puis publie `dist/`. Le fichier `package-lock.json` doit être conservé et mis à jour avec `npm install` lors de toute modification des dépendances.

L’application utilise le chemin de base `/Livres-de-Jean/` configuré dans `vite.config.ts`. Si le dépôt ou son URL de publication change, adapter cette valeur avant de déployer.

## Données et configuration

Le site est une application statique : aucune variable d’environnement ni aucun serveur n’est requis pour le déploiement GitHub Pages. Les données de panier, de compte et de commandes sont conservées dans le `localStorage` du navigateur et ne sont pas partagées entre appareils ou utilisateurs.

Les choix de paiement affichés dans l’interface ne constituent pas une intégration de paiement côté serveur. Ne pas utiliser ce déploiement comme une boutique de production pour traiter de vrais paiements ou des données sensibles sans ajouter un backend sécurisé et les intégrations correspondantes. Ne jamais incorporer de clé secrète dans le code client ou dans les fichiers publiés.

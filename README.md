# 🔧 Les Bonnes Pièces

Catalogue de pièces automobiles réalisé en **HTML, CSS et JavaScript pur** (sans framework) : filtres combinables, tri, favoris, avis clients et formulaire de contact.

🔗 **Démo en ligne :** (https://bonnes-pieces.netlify.app/)


## Fonctionnalités

- Filtres combinables : prix maximum, avec description, en stock, favoris uniquement
- Tri par prix croissant ou décroissant
- Favoris mémorisés dans le navigateur (localStorage)
- Avis clients : consultation et ajout
- Formulaire de contact (Netlify Forms)
- Interface responsive, mode sombre automatique, navigation au clavier

## 🛠️ Technologies

HTML5 · CSS3 (variables, grid) · JavaScript (modules ES) · Stripe Checkout · Netlify Functions · localStorage · Netlify Forms · tests avec `node:test`

## Structure

```
├── index.html        # Page et structure
├── styles.css        # Design (variables CSS, responsive, mode sombre)
├── pieces.js         # Affichage du catalogue, état des filtres, favoris
├── filtres.js        # Logique de filtrage et de tri (fonction pure)
├── filtres.test.js   # Tests de la logique de filtrage
├── avis.js           # Chargement, affichage et envoi des avis
├── contact.js        # Formulaire de contact
├── api.js            # Accès aux données (fichiers JSON ou API)
├── config.js         # Mode démo ou mode API
├── dom.js            # Création sécurisée des éléments HTML
├── panier.js         # Règles du panier et calcul des montants
├── panier-ui.js      # Affichage, actions et persistance du panier
├── panier.test.js    # Tests des règles et calculs du panier
├── paiement.js       # Appel de la fonction de paiement et redirection Checkout
├── netlify/functions/# Création et vérification serveur des sessions Stripe
├── data/             # Catalogue (pieces.json) et avis d'exemple (avis.json)
└── images/           # Illustrations et logo
```

### Parcours des données

`pieces.js` charge le catalogue via `api.js`, puis utilise `filtres.js` pour calculer les fiches visibles. Les avis passent également par `api.js` avant d'être affichés par `avis.js`. Le panier sépare ses règles indépendantes du navigateur (`panier.js`) de son interface et de sa sauvegarde (`panier-ui.js`). Les données de démonstration se trouvent dans `data/`; `config.js` permet de choisir cette source ou l'API locale.

## 🚀 Lancer le projet

1. Ouvre le dossier dans VS Code et lance **Live Server** sur `index.html`
   (le site doit être servi par un serveur, un double-clic sur le fichier ne suffit pas).
2. Dans `config.js`, `MODE_DEMO = true` utilise les fichiers du dossier `data/`.
   Avec `MODE_DEMO = false`, les données viennent d'une API sur `http://localhost:8081`.

### Paiement Stripe en mode test

Le paiement passe par `/.netlify/functions/create-checkout-session`. Le navigateur ne transmet que les identifiants et quantités; la fonction relit les prix et les disponibilités dans `data/pieces.json` et crée une session Stripe Checkout. Au retour, `/.netlify/functions/checkout-session-status` vérifie la session auprès de Stripe avant d'afficher la confirmation et de vider le panier. La clé secrète Stripe doit rester côté serveur; cette première version refuse volontairement les clés live.

1. Installe les dépendances avec `npm install`.
2. Dans le tableau de bord Netlify, ajoute `STRIPE_SECRET_KEY` aux variables d'environnement du site avec une clé de test Stripe (`sk_test_...`). Ne la mets jamais dans le code ou dans une variable JavaScript publique.
3. En local, démarre le site avec Netlify CLI et fournis les variables au processus, par exemple sur macOS/Linux : `URL=http://localhost:8888 STRIPE_SECRET_KEY=sk_test_... npx netlify-cli dev`. Live Server ne sert pas les fonctions Netlify.
4. Utilise les moyens de paiement de test Stripe. Configure la même variable dans Netlify avant de déployer.

La vérification au retour dépend de la navigation du client. Pour enregistrer ou traiter les commandes de façon fiable, ajoute aussi un webhook Stripe côté serveur : il recevra la confirmation même si le client ne revient pas sur le site.

### Tests

```bash
npm test
```

## Points techniques

- **Un seul état pour les filtres** : la page est toujours redessinée à partir de l'état et des données, ce qui évite les incohérences entre filtres.
- **Logique séparée de l'affichage** : `filtres.js` est testable sans navigateur.
- **Couche d'accès aux données** (`api.js`) : le reste du code ignore si les données viennent d'un fichier ou d'une API.
- **Sécurité** : les textes saisis par les visiteurs sont affichés avec `textContent`, jamais avec `innerHTML` (prévention des failles XSS).
- **Délégation d'événements** : un seul écouteur pour tous les boutons d'avis et de favoris.

## Auteure

**Laura Jennifer TCHITOMBI** :
[LinkedIn](https://linkedin.com/in/laura-tchitombi-b67a22204)
[GitHub](https://github.com/laulau-tlj)
[Portfolio](https://startling-cocada-167194.netlify.app)

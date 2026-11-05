# 🔧 Les Bonnes Pièces

Catalogue de pièces automobiles réalisé en **HTML, CSS et JavaScript pur** (sans framework) : filtres combinables, tri, favoris, avis clients et formulaire de contact.

🔗 **Démo en ligne :** [À COMPLÉTER : lien Netlify]

<!-- Ajoute une capture d'écran du site : ![Aperçu](./screenshot.png) -->

## ✨ Fonctionnalités

- Filtres combinables : prix maximum, avec description, en stock, favoris uniquement
- Tri par prix croissant ou décroissant
- Favoris mémorisés dans le navigateur (localStorage)
- Avis clients : consultation et ajout
- Formulaire de contact (Netlify Forms)
- Interface responsive, mode sombre automatique, navigation au clavier

## 🛠️ Technologies

HTML5 · CSS3 (variables, grid) · JavaScript (modules ES) · localStorage · Netlify Forms · tests avec `node:test`

## 📁 Structure

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
├── data/             # Pièces et avis d'exemple
└── images/           # Illustrations et logo
```

## 🚀 Lancer le projet

1. Ouvre le dossier dans VS Code et lance **Live Server** sur `index.html`
   (le site doit être servi par un serveur, un double-clic sur le fichier ne suffit pas).
2. Dans `config.js`, `MODE_DEMO = true` utilise les fichiers du dossier `data/`.
   Avec `MODE_DEMO = false`, les données viennent d'une API sur `http://localhost:8081`.

### Tests

```bash
npm test
```

## 🧠 Points techniques

- **Un seul état pour les filtres** : la page est toujours redessinée à partir de l'état et des données, ce qui évite les incohérences entre filtres.
- **Logique séparée de l'affichage** : `filtres.js` est testable sans navigateur.
- **Couche d'accès aux données** (`api.js`) : le reste du code ignore si les données viennent d'un fichier ou d'une API.
- **Sécurité** : les textes saisis par les visiteurs sont affichés avec `textContent`, jamais avec `innerHTML` (prévention des failles XSS).
- **Délégation d'événements** : un seul écouteur pour tous les boutons d'avis et de favoris.

## 👩🏾‍💻 Auteure

**Laura Jennifer TCHITOMBI** : [LinkedIn](https://linkedin.com/in/laura-tchitombi-b67a22204) · [GitHub](https://github.com/laulau-tlj) · [Portfolio](https://startling-cocada-167194.netlify.app)

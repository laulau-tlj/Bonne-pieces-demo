// Point d'entrée du navigateur : charge les données, relie les événements et redessine le catalogue.
import { MODE_DEMO } from "./config.js";
import { getPieces } from "./api.js";
import { ajoutListenerAvis, ajoutListenerEnvoyerAvis } from "./avis.js";
import { ajoutListenerContact, afficherCVSiPresent } from "./contact.js";
import { filtrerPieces } from "./filtres.js";
import { el } from "./dom.js";
import { initPanier, ajouterAuPanier } from "./panier-ui.js";

const grille = document.querySelector(".fiches");
const compteur = document.querySelector("#compteur");
const prixMax = document.querySelector("#prix-max");
const prixValeur = document.querySelector("#prix-valeur");
const avecDescription = document.querySelector("#avec-description");
const enStock = document.querySelector("#en-stock");
const favorisSeuls = document.querySelector("#favoris-seuls");
const nbFavoris = document.querySelector("#nb-favoris");
const tri = document.querySelector("#tri");
const selectPiece = document.querySelector("#piece-id");

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

// Source de vérité de l'affichage : les fiches visibles sont dérivées du catalogue et de cet état.
let pieces = [];
const etat = { prixMax: Infinity, avecDescription: false, enStock: false, favorisSeulement: false, tri: "defaut" };

// Favoris : mémorisés dans le navigateur du visiteur
function lireFavoris() {
	try {
		return new Set(JSON.parse(window.localStorage.getItem("favoris")) ?? []);
	} catch {
		// En cas de stockage invalide, démarrer sans favori plutôt que bloquer le catalogue.
		return new Set();
	}
}
const favoris = lireFavoris();

// Met à jour le cœur et son libellé accessible selon l'état du favori.
function majCoeur(bouton, actif, nom) {
	bouton.setAttribute("aria-pressed", String(actif));
	bouton.setAttribute("aria-label", `${actif ? "Retirer" : "Ajouter"} ${nom} ${actif ? "des" : "aux"} favoris`);
	bouton.textContent = actif ? "♥" : "♡";
}

function creerCoeur(piece) {
	const bouton = el("button", { type: "button", class: "coeur", "data-favori": piece.id });
	majCoeur(bouton, favoris.has(piece.id), piece.nom);
	return bouton;
}

async function chargerPieces({ forcer = false } = {}) {
	// Le bouton d'actualisation invalide ce cache pour relire la source de données.
	if (forcer) window.localStorage.removeItem("pieces");
	const enCache = window.localStorage.getItem("pieces");
	if (enCache) return JSON.parse(enCache);

	// Charge le catalogue depuis la source configurée puis le met en cache.
	const donnees = await getPieces();
	window.localStorage.setItem("pieces", JSON.stringify(donnees));
	return donnees;
}

function creerFiche(piece) {
	// Construit tous les éléments d'une fiche sans injecter de HTML depuis les données.
	const disponible = piece.disponibilite === true;
	return el("article", { "data-id": piece.id },
		el("div", { class: "visuel" },
			el("img", { src: piece.image, alt: piece.nom, loading: "lazy" }),
			creerCoeur(piece)),
		el("div", { class: "contenu" },
			el("h2", { text: piece.nom }),
			el("p", { class: "description", text: piece.description ?? "Pas de description pour le moment." }),
			el("p", { class: "specs" },
				el("span", { text: piece.categorie ?? "Sans catégorie" }),
				el("span", { class: `stock ${disponible ? "ok" : "rupture"}`, text: disponible ? "En stock" : "Rupture de stock" })),
			el("div", { class: "pied" },
				el("p", { class: "prix", text: formatPrix.format(piece.prix) }),
				el("button", { type: "button", class: "secondaire", "data-avis": piece.id, "aria-expanded": "false", text: "Voir les avis" })),
			el("button", { type: "button", class: "principal ajout-panier", "data-panier": piece.id, text: disponible ? "Ajouter au panier" : "Indisponible", ...(disponible ? {} : { disabled: "" }) }),
			el("div", { class: "avis", hidden: "" })));
}

// Applique les filtres puis le tri sur une copie : le tableau d'origine n'est jamais modifié
function piecesAffichees() {
	return filtrerPieces(pieces, etat, favoris);
}

function afficher() {
	// Reconstruit les fiches et les compteurs à partir des données et des filtres actuels.
	const liste = piecesAffichees();
	grille.replaceChildren(...liste.map(creerFiche));
	compteur.textContent = `${liste.length} pièce${liste.length > 1 ? "s" : ""} sur ${pieces.length}`;
	nbFavoris.textContent = `(${favoris.size})`;
	if (liste.length === 0) {
		grille.append(el("p", { class: "vide", text: etat.favorisSeulement && favoris.size === 0 ? "Pas encore de favoris : clique sur le cœur d'une pièce pour l'ajouter." : "Aucune pièce ne correspond à ces filtres. Augmente le prix maximum ou retire un filtre." }));
	}
}

function reinitialiserFiltres() {
	// Remet les contrôles visibles et l'objet d'état à leurs valeurs initiales.
	prixMax.value = prixMax.max;
	prixValeur.textContent = formatPrix.format(Number(prixMax.max));
	avecDescription.checked = false;
	enStock.checked = false;
	favorisSeuls.checked = false;
	tri.value = "defaut";
	Object.assign(etat, { prixMax: Number(prixMax.max), avecDescription: false, enStock: false, favorisSeulement: false, tri: "defaut" });
}

async function demarrer({ forcer = false } = {}) {
	compteur.textContent = "Chargement…";
	try {
		pieces = await chargerPieces({ forcer });
	} catch {
		// Affiche un message dans la page si la source de données ne répond pas.
		compteur.textContent = "Catalogue indisponible";
		grille.replaceChildren(el("p", { class: "vide erreur", text: "Impossible de charger les pièces. Vérifie ta connexion, puis clique sur « Actualiser le catalogue »." }));
		return;
	}
	// La borne du curseur s'adapte au prix le plus élevé du catalogue
	prixMax.max = Math.ceil(Math.max(...pieces.map((p) => p.prix)) / 5) * 5;
	initPanier(pieces);
	selectPiece.replaceChildren(...pieces.map((p) => el("option", { value: p.id, text: p.nom })));
	reinitialiserFiltres();
	afficher();
}

// Chaque contrôle ne modifie que l'état concerné, puis reconstruit les résultats depuis la source.
prixMax.addEventListener("input", () => {
	etat.prixMax = Number(prixMax.value);
	prixValeur.textContent = formatPrix.format(etat.prixMax);
	afficher();
});
avecDescription.addEventListener("change", () => { etat.avecDescription = avecDescription.checked; afficher(); });
enStock.addEventListener("change", () => { etat.enStock = enStock.checked; afficher(); });
tri.addEventListener("change", () => { etat.tri = tri.value; afficher(); });
favorisSeuls.addEventListener("change", () => { etat.favorisSeulement = favorisSeuls.checked; afficher(); });

// Un seul écouteur pour tous les cœurs (délégation)
grille.addEventListener("click", (event) => {
	const coeur = event.target.closest("[data-favori]");
	if (!coeur) return;
	const id = Number(coeur.dataset.favori);
	if (favoris.has(id)) favoris.delete(id); else favoris.add(id);
	window.localStorage.setItem("favoris", JSON.stringify([...favoris]));
	if (etat.favorisSeulement) {
		afficher();
	} else {
		majCoeur(coeur, favoris.has(id), coeur.closest("article").querySelector("h2").textContent);
		nbFavoris.textContent = `(${favoris.size})`;
	}
});
document.querySelector("#reinitialiser").addEventListener("click", () => { reinitialiserFiltres(); afficher(); });
document.querySelector("#maj").addEventListener("click", () => demarrer({ forcer: true }));

// Bouton « Ajouter au panier » : un seul écouteur pour toutes les fiches
grille.addEventListener("click", (event) => {
	const bouton = event.target.closest("[data-panier]");
	if (!bouton) return;
	const piece = pieces.find((p) => p.id === Number(bouton.dataset.panier));
	if (piece) ajouterAuPanier(piece);
});

ajoutListenerAvis(grille);
ajoutListenerContact(document.querySelector(".formulaire-contact"), document.querySelector(".message-contact"));
ajoutListenerEnvoyerAvis(document.querySelector(".formulaire-avis"), document.querySelector(".message-avis"));
if (MODE_DEMO) document.querySelector(".bandeau-demo").hidden = false;
afficherCVSiPresent(document.querySelector("#lien-cv"));
demarrer();

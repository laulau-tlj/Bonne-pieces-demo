import { el } from "./dom.js";
import { ajouter, changerQuantite, retirer, detaillerPanier } from "./panier.js";
import { demarrerPaiement } from "./paiement.js";

// Interface du panier : seules les quantités et les identifiants sont persistés;
// les informations et les prix sont reconstruits depuis le catalogue chargé.
const CLE = "panier";
const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

const dialogue = document.querySelector("#panier");
const liste = document.querySelector("#panier-liste");
const totalElement = document.querySelector("#panier-total");
const message = document.querySelector("#panier-message");
const badge = document.querySelector("#nb-panier");
const annonce = document.querySelector("#annonce");
const commander = document.querySelector("#commander");

function lireLignes() {
	try {
		// Ignore une valeur absente ou mal formée plutôt que de bloquer l'interface.
		const valeur = JSON.parse(window.localStorage.getItem(CLE));
		return Array.isArray(valeur) ? valeur : [];
	} catch {
		// Une donnée de stockage invalide est traitée comme un panier vide.
		return [];
	}
}

let lignes = lireLignes();
let catalogue = [];

function modifier(nouvellesLignes) {
	// Toute modification est sauvegardée puis immédiatement reflétée dans l'interface.
	lignes = nouvellesLignes;
	window.localStorage.setItem(CLE, JSON.stringify(lignes));
	afficherPanier();
}

function creerLigne({ piece, quantite, sousTotal }) {
	// Construit une ligne de panier avec les boutons de quantité et de suppression.
	return el("li", { class: "ligne-panier", "data-id": piece.id },
		el("img", { src: piece.image, alt: "" }),
		el("div", {},
			el("p", { class: "ligne-nom", text: piece.nom }),
			el("p", { class: "ligne-prix", text: formatPrix.format(sousTotal) }),
			el("div", { class: "quantite" },
				el("button", { type: "button", "data-action": "moins", "aria-label": `Retirer une unité de ${piece.nom}`, text: "−" }),
				el("span", { "aria-label": `Quantité : ${quantite}`, text: String(quantite) }),
				el("button", { type: "button", "data-action": "plus", "aria-label": `Ajouter une unité de ${piece.nom}`, text: "+" }),
				el("button", { type: "button", class: "supprimer", "data-action": "supprimer", text: "Supprimer" }))));
}

function afficherPanier() {
	// Recalcule le total à partir du catalogue, puis met à jour le badge et la liste.
	const { details, nombre, total } = detaillerPanier(lignes, catalogue);
	badge.textContent = nombre;
	totalElement.textContent = formatPrix.format(total);
	commander.disabled = nombre === 0;
	if (details.length === 0) {
		liste.replaceChildren(el("li", { class: "panier-vide", text: "Votre panier est vide." }));
		return;
	}
	liste.replaceChildren(...details.map(creerLigne));
}

export function ajouterAuPanier(piece) {
	// Ajoute une pièce et annonce le résultat aux technologies d'assistance.
	modifier(ajouter(lignes, piece));
	annonce.textContent = `${piece.nom} ajouté au panier.`;
}

export function initPanier(pieces) {
	// Le catalogue permet de retrouver les informations et prix des lignes sauvegardées.
	catalogue = pieces;
	afficherPanier();
}

// Un seul écouteur gère les boutons de toutes les lignes, même après leur redessin.
liste.addEventListener("click", (event) => {
	const bouton = event.target.closest("[data-action]");
	if (!bouton) return;
	const id = Number(bouton.closest("li").dataset.id);
	const ligne = lignes.find((l) => l.id === id);
	if (!ligne) return;
	if (bouton.dataset.action === "plus") modifier(changerQuantite(lignes, id, ligne.quantite + 1));
	if (bouton.dataset.action === "moins") modifier(changerQuantite(lignes, id, ligne.quantite - 1));
	if (bouton.dataset.action === "supprimer") modifier(retirer(lignes, id));
});

document.querySelector("#ouvrir-panier").addEventListener("click", () => { message.textContent = ""; dialogue.showModal(); });
document.querySelector("#fermer-panier").addEventListener("click", () => dialogue.close());
// Clic sur l'arrière-plan (et non sur son contenu) : ferme également la fenêtre modale.
dialogue.addEventListener("click", (event) => { if (event.target === dialogue) dialogue.close(); });

commander.addEventListener("click", async () => {
	// Empêche les clics répétés pendant la demande de paiement.
	commander.disabled = true;
	const resultat = await demarrerPaiement(detaillerPanier(lignes, catalogue));
	message.textContent = resultat.message;
	commander.disabled = lignes.length === 0;
});

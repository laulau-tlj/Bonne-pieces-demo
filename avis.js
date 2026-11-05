import { getAvis, envoyerAvis } from "./api.js";

// Récupère les avis d'une pièce et les garde en cache local
export async function chargerAvis(id) {
	const avis = await getAvis(id);
	window.localStorage.setItem(`avis-piece-${id}`, JSON.stringify(avis));
	return avis;
}

// Affiche les avis dans la zone prévue.
// textContent (et non innerHTML) : un commentaire malveillant ne peut pas injecter de HTML (faille XSS).
export function afficherAvis(zone, avis) {
	zone.replaceChildren();
	if (avis.length === 0) {
		const vide = document.createElement("p");
		vide.className = "avis-vide";
		vide.textContent = "Aucun avis pour le moment.";
		zone.append(vide);
		return;
	}
	for (const { utilisateur, commentaire, nbEtoiles } of avis) {
		// Limite la note à l'intervalle affichable, même si les données sont inattendues.
		const note = Math.min(5, Math.max(0, Number(nbEtoiles) || 0));
		const bloc = document.createElement("blockquote");

		const etoiles = document.createElement("span");
		etoiles.className = "etoiles";
		etoiles.textContent = "★".repeat(note) + "☆".repeat(5 - note);
		etoiles.setAttribute("aria-label", `${note} étoiles sur 5`);

		const texte = document.createElement("p");
		texte.textContent = commentaire;

		const auteur = document.createElement("cite");
		auteur.textContent = utilisateur;

		bloc.append(etoiles, texte, auteur);
		zone.append(bloc);
	}
}

// Un seul écouteur sur la grille (délégation) : il continue de fonctionner quand les fiches sont regénérées
export function ajoutListenerAvis(grille) {
	grille.addEventListener("click", async (event) => {
		const bouton = event.target.closest("[data-avis]");
		if (!bouton) return;

		// Le bouton ouvre ou replie les avis associés à la fiche qui le contient.
		const zone = bouton.closest("article").querySelector(".avis");
		const ouvert = bouton.getAttribute("aria-expanded") === "true";
		if (ouvert) {
			zone.hidden = true;
			bouton.setAttribute("aria-expanded", "false");
			bouton.textContent = "Voir les avis";
			return;
		}

		bouton.disabled = true;
		try {
			afficherAvis(zone, await chargerAvis(bouton.dataset.avis));
		} catch {
			const cache = window.localStorage.getItem(`avis-piece-${bouton.dataset.avis}`);
			if (cache) {
				afficherAvis(zone, JSON.parse(cache));
			} else {
				zone.textContent = "Impossible de charger les avis pour le moment.";
			}
		}
		zone.hidden = false;
		bouton.disabled = false;
		bouton.setAttribute("aria-expanded", "true");
		bouton.textContent = "Masquer les avis";
	});
}

// Ajoute un écouteur sur le formulaire d'avis pour l'envoyer via l'API
export function ajoutListenerEnvoyerAvis(formulaire, message) {
	formulaire.addEventListener("submit", async (event) => {
		event.preventDefault();
		// FormData récupère les valeurs des champs du formulaire par leur nom.
		const donnees = new FormData(formulaire);
		const avis = {
			pieceId: Number(donnees.get("piece-id")),
			utilisateur: donnees.get("utilisateur").trim(),
			commentaire: donnees.get("commentaire").trim(),
			nbEtoiles: Number(donnees.get("nbEtoiles"))
		};
		try {
			await envoyerAvis(avis);
			window.localStorage.removeItem(`avis-piece-${avis.pieceId}`);
			formulaire.reset();
			message.textContent = "Avis envoyé, merci !";
		} catch {
			message.textContent = "L'avis n'a pas pu être envoyé. Réessaie dans un instant.";
		}
	});
}

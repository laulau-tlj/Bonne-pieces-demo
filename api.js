import { MODE_DEMO, API_URL } from "./config.js";

// Couche d'accès aux données : elle masque au reste de l'application si les réponses
// viennent des fichiers JSON de démonstration ou du serveur configuré.

async function lireJSON(url) {
	// Vérifie la réponse HTTP avant d'essayer de lire son contenu JSON.
	const reponse = await fetch(url);
	if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`);
	return reponse.json();
}

function lireLocal(cle) {
	try {
		return JSON.parse(window.localStorage.getItem(cle)) ?? [];
	} catch {
		// Une valeur locale absente ou illisible ne doit pas empêcher la démo de fonctionner.
		return [];
	}
}

// Renvoie le catalogue depuis la source sélectionnée dans config.js.
export function getPieces() {
	return lireJSON(MODE_DEMO ? "data/pieces.json" : `${API_URL}/pieces`);
}

// Renvoie les avis d'une pièce, en ajoutant en mode démo ceux enregistrés localement.
export async function getAvis(id) {
	if (!MODE_DEMO) return lireJSON(`${API_URL}/pieces/${id}/avis`);
	const tous = await lireJSON("data/avis.json");
	const exemples = tous.filter((avis) => avis.pieceId === Number(id));
	return [...exemples, ...lireLocal(`avis-demo-${id}`)];
}

// Enregistre un avis dans le navigateur en mode démo, ou le transmet au serveur.
export async function envoyerAvis(avis) {
	if (MODE_DEMO) {
		// Pas de serveur en démo : l'avis reste dans le navigateur du visiteur
		const cle = `avis-demo-${avis.pieceId}`;
		window.localStorage.setItem(cle, JSON.stringify([...lireLocal(cle), avis]));
		return;
	}
	const reponse = await fetch(`${API_URL}/avis`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(avis)
	});
	if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`);
}

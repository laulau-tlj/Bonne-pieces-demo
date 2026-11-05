// Logique du panier : fonctions pures (aucun accès au DOM ni au navigateur), donc faciles à tester.
// Le panier est une liste de lignes { id, quantite }. Les prix ne sont jamais stockés dedans :
// ils sont relus dans le catalogue, pour ne pas faire confiance à une donnée modifiable côté navigateur.

export const QUANTITE_MAX = 10;

// Ajoute une pièce disponible, ou augmente sa quantité si elle est déjà présente.
export function ajouter(lignes, piece) {
	if (piece.disponibilite !== true) return lignes;
	const existante = lignes.find((ligne) => ligne.id === piece.id);
	if (!existante) return [...lignes, { id: piece.id, quantite: 1 }];
	return changerQuantite(lignes, piece.id, existante.quantite + 1);
}

// Retire du panier la ligne correspondant à l'identifiant reçu.
export function retirer(lignes, id) {
	return lignes.filter((ligne) => ligne.id !== id);
}

// Met à jour la quantité en respectant la limite et retire la ligne si elle tombe à zéro.
export function changerQuantite(lignes, id, quantite) {
	if (quantite <= 0) return retirer(lignes, id);
	return lignes.map((ligne) => ligne.id === id ? { ...ligne, quantite: Math.min(QUANTITE_MAX, quantite) } : ligne);
}

// Les montants sont calculés en centimes (nombres entiers) pour éviter les erreurs d'arrondi des décimaux.
// C'est aussi le format attendu par les API de paiement comme Stripe.
export function detaillerPanier(lignes, catalogue) {
	// Ignore les références absentes du catalogue et associe chaque ligne à sa pièce.
	const details = lignes.flatMap((ligne) => {
		const piece = catalogue.find((p) => p.id === ligne.id);
		if (!piece) return [];
		const centimes = Math.round(piece.prix * 100) * ligne.quantite;
		return [{ piece, quantite: ligne.quantite, centimes, sousTotal: centimes / 100 }];
	});
	return {
		details,
		nombre: details.reduce((somme, d) => somme + d.quantite, 0),
		total: details.reduce((somme, d) => somme + d.centimes, 0) / 100
	};
}

const QUANTITE_MAX = 10;

// Construit les articles facturables depuis les données serveur, jamais depuis les prix du navigateur.
export function creerLignesCheckout(articles, catalogue) {
	if (!Array.isArray(articles) || articles.length === 0 || articles.length > 50) {
		throw new TypeError("Le panier est vide ou invalide.");
	}

	const ids = new Set();
	return articles.map((article) => {
		// Vérifie que chaque article est valide et qu'il n'y a pas de doublons.
		if (!article || !Number.isSafeInteger(article.id) ||
			!Number.isInteger(article.quantite) ||
			article.quantite < 1 || article.quantite > QUANTITE_MAX ||
			ids.has(article.id)) {
			throw new TypeError("Le panier contient une pièce ou une quantité invalide.");
		}
		ids.add(article.id);

		const piece = catalogue.find((element) => element.id === article.id);
		// Vérifie que la pièce est disponible et que son prix est un nombre positif et sûr.
		if (!piece || piece.disponibilite !== true ||
			!Number.isFinite(piece.prix) || piece.prix <= 0 ||
			!Number.isSafeInteger(Math.round(piece.prix * 100))) {
			throw new TypeError("Une pièce du panier est inconnue ou indisponible.");
		}

		return {
			quantity: article.quantite,
			price_data: {
				currency: "eur",
				unit_amount: Math.round(piece.prix * 100),
				product_data: { name: piece.nom }
			}
		};
	});
}

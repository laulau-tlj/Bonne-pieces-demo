import test from "node:test";
import assert from "node:assert/strict";
import { creerLignesCheckout } from "../netlify/functions/checkout-cart.mjs";

//ici on définit un catalogue de test avec deux pièces, une disponible et une indisponible, pour tester la fonction creerLignesCheckout
const catalogue = [
	{ id: 1, nom: "Ampoule LED", prix: 60, disponibilite: true },
	{ id: 2, nom: "Pièce indisponible", prix: 5, disponibilite: false }
];

// Vérifie que la fonction creerLignesCheckout renvoie les lignes de paiement correctes pour un panier valide.
test("les prix envoyés à Stripe sont calculés depuis le catalogue serveur", () => {
	const lignes = creerLignesCheckout([{ id: 1, quantite: 2, prix: 0.01 }], catalogue);
	assert.deepEqual(lignes, [{
		quantity: 2,
		price_data: {
			currency: "eur",
			unit_amount: 6000,
			product_data: { name: "Ampoule LED" }
		}
	}]);
});

// Vérifie que la fonction creerLignesCheckout refuse les articles invalides ou le panier vide.
test("refuse les quantités non entières, nulles ou supérieures à la limite du panier", () => {
	for (const quantite of [0, 1.5, 11]) {
		assert.throws(
			() => creerLignesCheckout([{ id: 1, quantite }], catalogue),
			TypeError
		);
	}
});

// Vérifie que la fonction creerLignesCheckout refuse les articles avec des identifiants invalides ou des prix incorrects.
test("refuse les pièces inconnues ou indisponibles", () => {
	assert.throws(() => creerLignesCheckout([{ id: 99, quantite: 1 }], catalogue), TypeError);
	assert.throws(() => creerLignesCheckout([{ id: 2, quantite: 1 }], catalogue), TypeError);
});

// Vérifie que la fonction creerLignesCheckout refuse les articles avec des prix non valides dans le catalogue.
test("refuse un panier vide et les identifiants en double", () => {
	assert.throws(() => creerLignesCheckout([], catalogue), TypeError);
	assert.throws(() => creerLignesCheckout([
		{ id: 1, quantite: 1 },
		{ id: 1, quantite: 2 }
	], catalogue), TypeError);
});

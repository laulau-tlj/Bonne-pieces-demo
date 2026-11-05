import test from "node:test";
import assert from "node:assert/strict";
import { ajouter, retirer, changerQuantite, detaillerPanier, QUANTITE_MAX } from "./panier.js";

// Quelques pièces suffisent à tester les opérations du panier et les calculs de prix.
const ampoule = { id: 1, nom: "Ampoule LED", prix: 60, disponibilite: true };
const liquide = { id: 4, nom: "Liquide de frein", prix: 9.6, disponibilite: true };
const veilleuse = { id: 3, nom: "Ampoule boîte à gants", prix: 5.49, disponibilite: false };
const catalogue = [ampoule, liquide, veilleuse];

test("ajouter une pièce crée une ligne de quantité 1", () => {
	assert.deepEqual(ajouter([], ampoule), [{ id: 1, quantite: 1 }]);
});

test("ajouter deux fois la même pièce augmente la quantité", () => {
	assert.deepEqual(ajouter(ajouter([], ampoule), ampoule), [{ id: 1, quantite: 2 }]);
});

test("une pièce en rupture de stock ne peut pas être ajoutée", () => {
	assert.deepEqual(ajouter([], veilleuse), []);
});

test("la quantité est plafonnée", () => {
	assert.equal(changerQuantite([{ id: 1, quantite: 2 }], 1, 99)[0].quantite, QUANTITE_MAX);
});

test("une quantité à zéro retire la ligne", () => {
	assert.deepEqual(changerQuantite([{ id: 1, quantite: 2 }], 1, 0), []);
});

test("retirer supprime uniquement la pièce visée", () => {
	assert.deepEqual(retirer([{ id: 1, quantite: 1 }, { id: 4, quantite: 2 }], 1), [{ id: 4, quantite: 2 }]);
});

test("le total est exact grâce au calcul en centimes", () => {
	const { total, nombre } = detaillerPanier([{ id: 4, quantite: 3 }, { id: 1, quantite: 1 }], catalogue);
	assert.equal(total, 88.8);
	assert.equal(nombre, 4);
});

test("les prix viennent du catalogue et une pièce inconnue est ignorée", () => {
	const { details } = detaillerPanier([{ id: 99, quantite: 2 }, { id: 1, quantite: 1 }], catalogue);
	assert.deepEqual(details.map((d) => d.piece.id), [1]);
});

test("ajouter ne modifie pas le panier d'origine", () => {
	const avant = [{ id: 1, quantite: 1 }];
	ajouter(avant, ampoule);
	assert.deepEqual(avant, [{ id: 1, quantite: 1 }]);
});

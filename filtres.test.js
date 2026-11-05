import test from "node:test";
import assert from "node:assert/strict";
import { filtrerPieces } from "./filtres.js";

// Jeu de données réduit utilisé pour vérifier les filtres sans dépendre du navigateur.
const pieces = [
	{ id: 1, nom: "Ampoule LED", prix: 60, description: "Éclaire loin", disponibilite: true },
	{ id: 2, nom: "Plaquettes de frein", prix: 40, description: "Freinage optimal", disponibilite: true },
	{ id: 3, nom: "Ampoule boîte à gants", prix: 5.49, description: "Pour l'habitacle", disponibilite: false },
	{ id: 4, nom: "Liquide de frein", prix: 9.6, disponibilite: true }
];
const sansFiltre = { prixMax: Infinity, avecDescription: false, enStock: false, favorisSeulement: false, tri: "defaut" };
const ids = (liste) => liste.map((piece) => piece.id);

test("sans filtre, toutes les pièces sont renvoyées dans l'ordre du catalogue", () => {
	assert.deepEqual(ids(filtrerPieces(pieces, sansFiltre)), [1, 2, 3, 4]);
});

test("le prix maximum exclut les pièces trop chères", () => {
	assert.deepEqual(ids(filtrerPieces(pieces, { ...sansFiltre, prixMax: 40 })), [2, 3, 4]);
});

test("« avec description » retire les pièces sans description", () => {
	assert.deepEqual(ids(filtrerPieces(pieces, { ...sansFiltre, avecDescription: true })), [1, 2, 3]);
});

test("« en stock » retire les pièces en rupture", () => {
	assert.deepEqual(ids(filtrerPieces(pieces, { ...sansFiltre, enStock: true })), [1, 2, 4]);
});

test("« favoris uniquement » ne garde que les favoris", () => {
	assert.deepEqual(ids(filtrerPieces(pieces, { ...sansFiltre, favorisSeulement: true }, new Set([2, 4]))), [2, 4]);
});

test("les filtres se combinent", () => {
	const etat = { ...sansFiltre, prixMax: 50, avecDescription: true, enStock: true };
	assert.deepEqual(ids(filtrerPieces(pieces, etat)), [2]);
});

test("le tri fonctionne dans les deux sens", () => {
	assert.deepEqual(ids(filtrerPieces(pieces, { ...sansFiltre, tri: "croissant" })), [3, 4, 2, 1]);
	assert.deepEqual(ids(filtrerPieces(pieces, { ...sansFiltre, tri: "decroissant" })), [1, 2, 4, 3]);
});

test("le tri ne modifie pas le tableau d'origine", () => {
	const copie = ids(pieces);
	filtrerPieces(pieces, { ...sansFiltre, tri: "decroissant" });
	assert.deepEqual(ids(pieces), copie);
});

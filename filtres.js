// Logique des filtres et du tri : fonction pure (aucun accès au DOM), donc facile à tester.
// etat contient les valeurs des contrôles; favoris est un Set d'identifiants de pièces.
export function filtrerPieces(pieces, etat, favoris = new Set()) {
	const liste = pieces.filter((piece) =>
		piece.prix <= etat.prixMax &&
		(!etat.avecDescription || Boolean(piece.description)) &&
		(!etat.enStock || piece.disponibilite === true) &&
		(!etat.favorisSeulement || favoris.has(piece.id)));
	// Le tri s'applique à la copie filtrée : le tableau d'origine n'est jamais modifié
	if (etat.tri === "croissant") liste.sort((a, b) => a.prix - b.prix);
	if (etat.tri === "decroissant") liste.sort((a, b) => b.prix - a.prix);
	return liste;
}

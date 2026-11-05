// Crée un élément, applique ses attributs, puis lui ajoute les enfants fournis.
// La propriété spéciale "text" utilise textContent pour traiter le texte comme du contenu, pas du HTML.
export function el(tag, props = {}, ...enfants) {
	const noeud = document.createElement(tag);
	const { text, ...attributs } = props;
	if (text !== undefined) noeud.textContent = text;
	for (const [cle, valeur] of Object.entries(attributs)) noeud.setAttribute(cle, valeur);
	noeud.append(...enfants);
	return noeud;
}

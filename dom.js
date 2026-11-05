// Petit utilitaire pour créer un élément du DOM en une ligne
export function el(tag, props = {}, ...enfants) {
	const noeud = document.createElement(tag);
	const { text, ...attributs } = props;
	if (text !== undefined) noeud.textContent = text;
	for (const [cle, valeur] of Object.entries(attributs)) noeud.setAttribute(cle, valeur);
	noeud.append(...enfants);
	return noeud;
}

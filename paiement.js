// Point d'entrée du paiement : le panier détaillé est fourni par l'interface.
// L'intégration Stripe n'est pas encore implémentée; cette réponse évite de simuler un succès.
export async function demarrerPaiement() {
	return { ok: false, message: "Le paiement en ligne (mode test) sera disponible prochainement." };
}

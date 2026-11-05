import Stripe from "stripe";

// Crée une réponse JSON pour l'API Netlify Functions avec le code de statut et le contenu fourni.
const reponseJSON = (statusCode, contenu) => ({
	statusCode,
	headers: {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store"
	},
	body: JSON.stringify(contenu)
});

// Vérifie l'état d'une session Stripe Checkout pour savoir si le paiement est confirmé.
export async function handler(event) {
	if (event.httpMethod !== "GET") {
		return reponseJSON(405, { error: "Méthode non autorisée." });
	}
	// Vérifie que la clé Stripe de test est configurée, sinon refuse la demande.
	if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
		console.error("Une clé Stripe de test STRIPE_SECRET_KEY doit être configurée.");
		return reponseJSON(500, { error: "La vérification du paiement n'est pas configurée." });
	}

	// Récupère l'identifiant de session depuis les paramètres de requête et le valide.
	const sessionId = new URL(event.rawUrl).searchParams.get("session_id");
	//ici on vérifie que l'identifiant de session est présent et qu'il correspond au format attendu pour une session Stripe Checkout de test
	if (!sessionId || !/^cs_test_[A-Za-z0-9]+$/.test(sessionId)) {
		return reponseJSON(400, { error: "Identifiant de session invalide." });
	}

	// Crée un client Stripe et récupère la session pour vérifier son état de paiement.
	try {
		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		return reponseJSON(200, { paid: session.payment_status === "paid" });
	} catch (erreur) {
		console.error("Impossible de vérifier la session Stripe.", erreur);
		return reponseJSON(502, { error: "La vérification du paiement a échoué." });
	}
}

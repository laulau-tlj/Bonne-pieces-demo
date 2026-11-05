import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Stripe from "stripe";
import { creerLignesCheckout } from "./checkout-cart.mjs";

// Répond en JSON avec le code HTTP et le contenu fourni.
const reponseJSON = (statusCode, contenu) => ({
	statusCode,
	headers: {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store"
	},
	body: JSON.stringify(contenu)
});

// Crée une session Stripe Checkout pour le panier fourni, en validant les prix depuis le catalogue serveur.
export async function handler(event) {
	// Vérifie la méthode HTTP et la configuration Stripe.
	if (event.httpMethod !== "POST") {
		return reponseJSON(405, { error: "Méthode non autorisée." });
	}
	// Vérifie que la clé Stripe de test est configurée, sinon refuse la demande.
	if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
		console.error("Une clé Stripe de test STRIPE_SECRET_KEY doit être configurée.");
		return reponseJSON(500, { error: "Le paiement de test n'est pas configuré sur le serveur." });
	}

	let articles;
	// Vérifie que le corps de la requête contient un JSON valide avec un tableau d'articles.
	try {
		articles = JSON.parse(event.body ?? "").items;
	} catch {
		return reponseJSON(400, { error: "Corps de requête JSON invalide." });
	}

	let catalogue;
	// Charge le catalogue depuis le fichier JSON du serveur pour vérifier les prix et la disponibilité.
	try {
		catalogue = JSON.parse(
			await readFile(resolve(process.cwd(), "data/pieces.json"), "utf8")
		);
	} catch (erreur) {
		console.error("Impossible de charger le catalogue pour le paiement.", erreur);
		return reponseJSON(500, { error: "Le catalogue est temporairement indisponible." });
	}

	let lignes;
	// Crée les lignes de paiement Stripe à partir des articles du panier, en validant les prix et la disponibilité.
	try {
		lignes = creerLignesCheckout(articles, catalogue);
	} catch (erreur) {
		if (erreur instanceof TypeError) {
			return reponseJSON(400, { error: erreur.message });
		}
		console.error("Erreur interne pendant la validation du panier.", erreur);
		return reponseJSON(500, { error: "Le panier n'a pas pu être vérifié." });
	}

	// Crée la session Stripe Checkout avec les lignes validées et les URL de retour.
	try {
		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
		const baseUrl = process.env.DEPLOY_PRIME_URL || process.env.URL;
		// Vérifie que l'URL publique du site est configurée pour construire les URL de retour.
		if (!baseUrl) {
			console.error("L'URL publique du site (URL) n'est pas configurée.");
			return reponseJSON(500, { error: "L'adresse de retour du paiement n'est pas configurée." });
		}
		const successUrl = new URL("/", baseUrl);
		successUrl.search = "?checkout=success&session_id={CHECKOUT_SESSION_ID}";
		const cancelUrl = new URL("/", baseUrl);
		cancelUrl.searchParams.set("checkout", "cancel");

		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items: lignes,
			success_url: successUrl.toString(),
			cancel_url: cancelUrl.toString()
		});

		// Vérifie que Stripe a fourni une URL de paiement avant de répondre au client.
		if (!session.url) throw new Error("Stripe n'a pas fourni d'URL Checkout.");
		return reponseJSON(200, { url: session.url });
	} catch (erreur) {
		console.error("Échec de création de la session Stripe.", erreur);
		return reponseJSON(502, { error: "Stripe n'a pas pu démarrer le paiement. Réessaie plus tard." });
	}
}

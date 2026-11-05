// Demande au serveur Netlify de créer une session Checkout avec les prix du catalogue serveur.
export async function demarrerPaiement(lignes) {
	//ici on envoie les lignes du panier au serveur pour créer une session de paiement Stripe
	const reponse = await fetch("/.netlify/functions/create-checkout-session", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			items: lignes.map(({ id, quantite }) => ({ id, quantite }))
		})
	});

	const resultat = await reponse.json();
	//si la réponse du serveur n'est pas ok, on lance une erreur avec le message du serveur
	if (!reponse.ok) {
		throw new Error(resultat.error ?? "Impossible de démarrer le paiement.");
	}
	if (typeof resultat.url !== "string") {
		throw new Error("Le serveur n'a pas fourni l'adresse de paiement.");
	}

	//ici on redirige l'utilisateur vers l'URL de paiement fournie par Stripe
	window.location.assign(resultat.url);
}

// Demande au serveur de vérifier l'état de la session avant d'annoncer un paiement confirmé.
export async function verifierPaiement(sessionId) {
	const parametres = new URLSearchParams({ session_id: sessionId });
	const reponse = await fetch(`/.netlify/functions/checkout-session-status?${parametres}`);
	const resultat = await reponse.json();
	if (!reponse.ok) {
		throw new Error(resultat.error ?? "Impossible de vérifier le paiement.");
	}
	return resultat.paid === true;
}

// Formulaire de contact : envoyé via Netlify Forms une fois le site en ligne
export function ajoutListenerContact(formulaire, message) {
	formulaire.addEventListener("submit", async (event) => {
		// Garde l'utilisateur sur la page après l'envoi.
		event.preventDefault();
		const bouton = formulaire.querySelector("button");
		bouton.disabled = true;
		try {
			// Netlify attend les champs du formulaire encodés en URL.
			const reponse = await fetch("/", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams(new FormData(formulaire)).toString()
			});
			// En cas de succès, vide le formulaire et affiche une confirmation.
			if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`);
			formulaire.reset();
			message.style.color = "green";
			message.textContent = "Message envoyé, merci ! Je vous répondrai rapidement.";
		} catch {
			message.textContent = "Le message n'a pas pu être envoyé. Écrivez-moi directement à tchitombilaura@gmail.com.";
		}
		bouton.disabled = false;
	});
}

// Affiche le bouton « Télécharger mon CV » seulement si le fichier PDF existe sur le site
export async function afficherCVSiPresent(lien) {
	try {
		// HEAD vérifie le fichier sans télécharger tout le PDF.
		const reponse = await fetch(lien.getAttribute("href"), { method: "HEAD" });
		if (reponse.ok && (reponse.headers.get("content-type") ?? "").includes("pdf")) lien.hidden = false;
	} catch {
		// Pas de CV disponible : le bouton reste caché
	}
}

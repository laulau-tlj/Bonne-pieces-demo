// Formulaire de contact : envoyé via Netlify Forms une fois le site en ligne
export function ajoutListenerContact(formulaire, message) {
	formulaire.addEventListener("submit", async (event) => {
		event.preventDefault();
		const bouton = formulaire.querySelector("button");
		bouton.disabled = true;
		try {
			const reponse = await fetch("/", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams(new FormData(formulaire)).toString()
			});
			if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`);
			formulaire.reset();
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
		const reponse = await fetch(lien.getAttribute("href"), { method: "HEAD" });
		if (reponse.ok && (reponse.headers.get("content-type") ?? "").includes("pdf")) lien.hidden = false;
	} catch {
		// Pas de CV disponible : le bouton reste caché
	}
}

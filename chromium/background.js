chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkAvailability") {
        const slug = request.slug;
        console.log("[Background] Vérification disponibilité pour :", slug);

        const apiUrl = `https://gog-games.to/api/web/query-game/${slug}`;

        // Utilisation d'une fonction async auto-exécutée
        (async () => {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    console.log("[Background] Jeu non trouvé sur l'API", apiUrl);
                    sendResponse({ available: false });
                    return;
                }

                const data = await response.json();
                const isAvailable = data.game_info && data.files && data.files.length > 0;
                console.log("[Background] Disponibilité :", isAvailable);
                sendResponse({ available: isAvailable });
            } catch (err) {
                console.error("[Background] Erreur fetch:", err);
                sendResponse({ available: false });
            }
        })();

        return true;
    }
});

async function loadGame() {
    try {
        // Retrieve latest build address
        const response = await fetch("/api/latest-build");

        if (!response.ok) {
            throw new Error("Impossibile recuperare la build");
        }

        const data = await response.json();

        // Load build into game frame
        const iframe = document.getElementById("game-frame");
        iframe.src = data.url;

    } catch (error) {
        console.error(error);

        document.getElementById("game-error").textContent =
            "Non è stato possibile caricare il gioco.";
    }
}

loadGame();

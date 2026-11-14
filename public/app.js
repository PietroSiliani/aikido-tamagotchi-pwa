
async function loadGame() {
    try {
        const response = await fetch("/api/latest-build");

        if (!response.ok) {
            throw new Error("Unable to load game URL");
        }

        const data = await response.json();

        const iframe = document.getElementById("game-frame");

        iframe.src = data.url;

    } catch (error) {
        console.error(error);

        document.getElementById("game-error").textContent =
            "Could not load the game.";
    }
}

loadGame();

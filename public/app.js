
async function loadGame() {
    try {
        const response = await fetch("/api/latest-build");

        if (!response.ok) {
            throw new Error("Unable to load game URL");
        }

        const data = await response.json();
        const build_url = data.url

        var iframe = document.createElement('iframe');
        iframe.setAttribute('allowtransparency', 'true');
        iframe.setAttribute('webkitallowfullscreen', 'true');
        iframe.setAttribute('mozallowfullscreen', 'true');
        iframe.setAttribute('msallowfullscreen', 'true');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('allow', 'autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; accelerometer; xr; cross-origin-isolated; web-share');
        iframe.id = 'game';
        iframe.src = build_url + '#installed';
        // iframe.onload = () => {
        //     let storageDict = JSON.parse(JSON.stringify(localStorage));
        //     document.querySelector('iframe').contentWindow.postMessage({
        //         'localStorage': storageDict
        //     }, '*');
        // };
        document.body.appendChild(iframe);


    } catch (error) {
        console.error(error);

        document.getElementById("game-error").textContent =
            "Could not load the game.";
    }
}

loadGame();
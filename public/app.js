const PREFIX = "Aikigotchi_";
let gameOrigin = null;

async function loadGame() {
    try {
        const response = await fetch("/api/latest-build");
        if (!response.ok) throw new Error("Unable to load game URL");

        const { url: buildUrl } = await response.json();
        gameOrigin = new URL(buildUrl).origin;

        const iframe = document.createElement("iframe");
        iframe.id = "game";
        iframe.title = "Aikigotchi";
        iframe.src = buildUrl + "#installed";
        iframe.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:none;display:block;";
        iframe.setAttribute("allowtransparency", "true");
        iframe.setAttribute("allowfullscreen", "true");
        iframe.setAttribute("webkitallowfullscreen", "true");
        iframe.setAttribute("mozallowfullscreen", "true");
        iframe.setAttribute("msallowfullscreen", "true");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("scrolling", "no");
        iframe.setAttribute("allow", "autoplay; fullscreen *; gamepad; gyroscope; accelerometer; web-share");

        // iframe.onload = () => {
        //     const storageDict = {};
        //     for (const [k, v] of Object.entries(localStorage)) {
        //         if (k.startsWith(PREFIX)) storageDict[k] = v;
        //     }
        //     iframe.contentWindow.postMessage({ localStorage: storageDict }, gameOrigin);
        // };
        document.body.appendChild(iframe);
    } catch (error) {
        console.error(error);
        document.getElementById("game-error").textContent = "Could not load the game.";
    }
}

window.addEventListener("message", (e) => {
    const game = document.getElementById("game");
    if (!game || e.source !== game.contentWindow) return;   // ignore anything not from the game

    const data = e.data;
    if (typeof data !== "object" || data === null) return;

    if (data.gameReady) {
        const storageDict = {};
        for (const [k, v] of Object.entries(localStorage)) {
            if (k.startsWith(PREFIX)) storageDict[k] = v;
        }
        e.source.postMessage({ localStorage: storageDict }, gameOrigin);
        return;
    }

    else if (data.localStorage) {
        for (const [k, v] of Object.entries(data.localStorage)) {
            localStorage.setItem(k, v);
        }
    }
    else if (typeof data.localStorageRemove === "string") {
        localStorage.removeItem(data.localStorageRemove);
    }
});

const dbg = document.createElement("pre");
dbg.style.cssText = "position:fixed;top:0;left:0;z-index:9999;margin:0;padding:4px;font:10px monospace;color:#0f0;background:rgba(0,0,0,.6);max-width:100%;pointer-events:none;white-space:pre-wrap";
document.body.appendChild(dbg);
const log = (m) => { dbg.textContent = (m + "\n" + dbg.textContent).slice(0, 800); };

window.addEventListener("message", (e) => {
    const g = document.getElementById("game");
    const d = e.data;
    log(`msg origin=${e.origin} fromGame=${!!g && e.source === g.contentWindow} ` +
        `type=${d && typeof d === "object" ? Object.keys(d).join(",") : typeof d} ` +
        `keys=${Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).join(",")}`);
}, true);   // capture phase, so it logs even when the main listener returns early

loadGame();
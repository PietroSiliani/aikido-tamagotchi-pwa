const PREFIX = "Aikigotchi_";
let gameOrigin = null;

async function loadGame() {
    try {
        const response = await fetch("/api/latest-build");
        if (!response.ok) throw new Error("Unable to load game URL");

        const { url: buildUrl } = await response.json();

        // log("iframe src=" + buildUrl + "#installed");
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

const GAME_ORIGIN = "https://html-classic.itch.zone";

window.addEventListener("message", (e) => {
    if (e.origin !== GAME_ORIGIN) {
        // log(`REJECT origin=${e.origin}`); 
        return;
    }

    const data = e.data;
    if (typeof data !== "object" || data === null) {
        // log(`REJECT not-object: ${typeof data}`); 
        return;
    }

    if (data.gameReady) {
        const storageDict = {};
        for (const [k, v] of Object.entries(localStorage)) {
            if (k.startsWith(PREFIX)) storageDict[k] = v;
        }
        e.source.postMessage({ wrapper: "aikigotchi", localStorage: storageDict }, e.origin);
        // log(`REPLIED to gameReady with ${Object.keys(storageDict).length} keys`);
        return;
    }
    if (data.localStorage) {
        const keys = Object.keys(data.localStorage);
        // log(`SYNC keys=${keys.join(",") || "(empty object)"}`);
        for (const [k, v] of Object.entries(data.localStorage)) {
            if (k.startsWith(PREFIX)) localStorage.setItem(k, v);
        }
    } else if (typeof data.localStorageRemove === "string") {
        // log(`REMOVE ${data.localStorageRemove}`);
        if (data.localStorageRemove.startsWith(PREFIX)) localStorage.removeItem(data.localStorageRemove);
    }
    // else {
    //     log(`IGNORED keys=${Object.keys(data).join(",")}`);
    // }
});

// const APP_VERSION = "dbg-3";

// const dbg = document.createElement("pre");
// dbg.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;margin:0;padding:6px;" +
//     "font:12px/1.3 monospace;color:#000;background:#0f0;max-height:40vh;overflow:hidden;" +
//     "pointer-events:none;white-space:pre-wrap;word-break:break-all";
// (document.body || document.documentElement).appendChild(dbg);
// const log = (m) => { dbg.textContent = (new Date().toLocaleTimeString() + " " + m + "\n" + dbg.textContent).slice(0, 1500); };

// log(`app.js ${APP_VERSION} running, standalone=${navigator.standalone === true}, hash="${location.hash}"`);

// window.addEventListener("message", (e) => {
//     const g = document.getElementById("game");
//     const d = e.data;
//     log(`msg origin=${e.origin} fromGame=${!!g && e.source === g.contentWindow} ` +
//         `type=${d && typeof d === "object" ? Object.keys(d).join(",") : typeof d} ` +
//         `saved=${Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).join(",") || "none"}`);
// }, true);

loadGame();
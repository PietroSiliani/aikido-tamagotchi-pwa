const PREFIX = "Aikigotchi_";
const DB_NAME = "aikigotchi-wrapper", STORE = "kv";
const GAME_ORIGIN = "https://html-classic.itch.zone";


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

let dbPromise = null;
function idb() {
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
        const r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(STORE);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
    });
    return dbPromise;
}
async function idbPut(k, v) {
    const db = await idb();
    return new Promise((res, rej) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(v, k);
        tx.oncomplete = res; tx.onerror = tx.onabort = () => rej(tx.error);
    });
}
async function idbDelete(k) {
    const db = await idb();
    return new Promise((res, rej) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(k);
        tx.oncomplete = res; tx.onerror = tx.onabort = () => rej(tx.error);
    });
}
async function idbGetAll() {
    const db = await idb();
    return new Promise((resolve, reject) => {
        const out = {};
        const req = db.transaction(STORE, "readonly").objectStore(STORE).openCursor();
        req.onsuccess = () => {
            const c = req.result;
            if (c) { if (String(c.key).startsWith(PREFIX)) out[c.key] = c.value; c.continue(); }
            else resolve(out);
        };
        req.onerror = () => reject(req.error);
    });
}

// One-time migration of existing localStorage saves
const migrated = (async () => {
    try {
        for (const k of Object.keys(localStorage)) {
            if (!k.startsWith(PREFIX)) continue;
            const existing = await idbGetAll();
            if (existing[k] === undefined) await idbPut(k, localStorage.getItem(k));
            localStorage.removeItem(k);
        }
    } catch (e) { console.error("migration failed", e); }
})();

if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });

window.addEventListener("message", async (e) => {
    if (e.origin !== GAME_ORIGIN) return;
    const data = e.data;
    if (typeof data !== "object" || data === null) return;

    try {
        if (data.gameReady) {
            await migrated;
            const dict = await idbGetAll();
            e.source.postMessage({ wrapper: "aikigotchi", localStorage: dict }, e.origin);
        } else if (data.localStorage) {
            for (const [k, v] of Object.entries(data.localStorage))
                if (k.startsWith(PREFIX)) await idbPut(k, v);
        } else if (typeof data.localStorageRemove === "string" && data.localStorageRemove.startsWith(PREFIX)) {
            await idbDelete(data.localStorageRemove);
        }
    } catch (err) {
        console.error("[wrapper] storage error", err);
    }
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
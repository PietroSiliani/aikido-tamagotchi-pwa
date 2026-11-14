
export async function onRequest(context) {
    const { env } = context;

    // Controlliamo che le variabili siano state configurate
    if (!env.ITCH_API_KEY || !env.ITCH_GAME_ID) {
        return new Response(
            JSON.stringify({ error: "Configurazione itch.io mancante" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    const uploadsURL =
        `https://itch.io/api/1/${env.ITCH_API_KEY}/game/${env.ITCH_GAME_ID}/uploads`;

    try {
        const response = await fetch(uploadsURL);

        if (!response.ok) {
            return new Response(
                JSON.stringify({
                    error: `Errore itch.io: ${response.status}`
                }),
                {
                    status: response.status,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const uploads = await response.json();

        if (!uploads?.uploads?.length) {
            return new Response(
                JSON.stringify({ error: "Nessun upload trovato" }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const buildURL = `https://html-classic.itch.zone/html/${upload.id}/index.html`;

        return new Response(
            JSON.stringify({ url: buildURL }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store"
                }
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ "msg": error }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}

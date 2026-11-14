
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
                    error: `itch.io API error: ${response.status}`
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

        const uploadId = uploads.uploads[0].id
        const embedURL = `https://itch.io/embed-upload/${uploadId}?color=333333`;

        return Response.json({
            url: embedURL
        });

    } catch (error) {
        return new Response(
            JSON.stringify({ "msg": `${error}` }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}

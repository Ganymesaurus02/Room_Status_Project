/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
    async fetch(request, env, ctx) {
        const status = "busy";

        let message = "";

        if (status === "sleeping") {
            message = "😴 Sleeping<br>Please don't knock unless it's important.";
        } else if (status === "busy") {
            message = "🟠 Busy<br>Knock only if it's important.";
        } else if (status === "awake") {
            message = "🟢 Awake<br>You may knock!";
        }

        return new Response(`
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Room Status</title>
                </head>
                <body>
                    <h1>Room Status</h1>
                    <h2>${message}</h2>
                </body>
            </html>
        `, {
            headers: {
                "Content-Type": "text/html"
            }
        });
    },
};

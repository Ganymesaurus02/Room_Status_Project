export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        const status = await env.ROOM_STATUS.get("status");

      if (path === "/admin") {
    const cookies = request.headers.get("Cookie") || "";
    const sessionToken = cookies
        .split(";")
        .find(cookie => cookie.trim().startsWith("session="))
        ?.split("=")[1];

    const isLoggedIn = sessionToken
        ? await env.ROOM_STATUS.get(`session:${sessionToken}`)
        : null;

    if (request.method === "POST") {
        const formData = await request.formData();

        // Login
        if (formData.get("password")) {
            const password = formData.get("password");

            if (password !== env.ADMIN_PASSWORD) {
                return new Response("Wrong password", { status: 401 });
            }

            const token = crypto.randomUUID();

            await env.ROOM_STATUS.put(`session:${token}`, "authenticated", {
                expirationTtl: 86400
            });

            return new Response("Logged in. You can now use the controls.", {
                headers: {
                    "Set-Cookie": `session=${token}; HttpOnly; SameSite=Strict; Path=/admin; Max-Age=86400`,
                    "Location": "/admin"
                },
                status: 302
            });
        }

        // Change status
        if (!isLoggedIn) {
            return new Response("Unauthorized", { status: 401 });
        }

        const newStatus = formData.get("status");

        if (newStatus === "sleeping" || newStatus === "busy" || newStatus === "awake") {
            await env.ROOM_STATUS.put("status", newStatus);

            return new Response(`
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Room Status Control</title>
                    </head>
                    <body>
                        <h1>Status changed to ${newStatus}</h1>
                        <p><a href="/admin">Back to controls</a></p>
                    </body>
                </html>
            `, {
                headers: {
                    "Content-Type": "text/html"
                }
            });
        }

        return new Response("Invalid status", { status: 400 });
    }

    // Show login page if not logged in
    if (!isLoggedIn) {
        return new Response(`
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Admin Login</title>
                </head>
                <body>
                    <h1>Room Status Admin</h1>

                    <form method="POST">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                        >

                        <button type="submit">Login</button>
                    </form>
                </body>
            </html>
        `, {
            headers: {
                "Content-Type": "text/html"
            }
        });
    }

    // Show controls if logged in
    return new Response(`
        <html>
            <head>
                <meta charset="UTF-8">
                <title>Room Status Control</title>
            </head>
            <body>
                <h1>Room Status Control</h1>

                <form method="POST">
                    <button type="submit" name="status" value="sleeping">😴 Sleeping</button>
                    <button type="submit" name="status" value="busy">🟠 Busy</button>
                    <button type="submit" name="status" value="awake">🟢 Awake</button>
                </form>
            </body>
        </html>
    `, {
        headers: {
            "Content-Type": "text/html"
        }
    });
}

        if (path !== "/status") {
            return new Response("Not found", { status: 404 });
        }

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
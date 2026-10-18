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

                if (formData.get("password")) {
                    const password = formData.get("password");
                    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
                    const attemptsKey = `login-attempts:${ip}`;
                    const attempts = Number(await env.ROOM_STATUS.get(attemptsKey) || "0");

                    if (attempts >= 5) {
                        return new Response("Too many failed attempts. Try again in 15 minutes.", {
                        status: 429,
                        headers: { "Content-Type": "text/plain" }
                        });
                    }

                    if (password !== env.ADMIN_PASSWORD) {
                        const failedAttempts = Number(await env.ROOM_STATUS.get(attemptsKey) || "0");
                        await env.ROOM_STATUS.put(attemptsKey, String(failedAttempts + 1), {
                            expirationTtl: 900
                        });
                        return new Response(`
                            <html>
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Room Status</title>
                                    <style>
                                        body {
                                            margin: 0;
                                            min-height: 100vh;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            background: #171329;
                                            color: #f8f7ff;
                                            font-family: Arial, sans-serif;
                                        }

                                        .card {
                                            width: 90%;
                                            max-width: 380px;
                                            padding: 35px;
                                            text-align: center;
                                            background: #241b4b;
                                            border-radius: 24px;
                                            box-shadow: 0 20px 60px rgba(0,0,0,0.35);
                                        }

                                        h1 {
                                            margin-bottom: 10px;
                                        }

                                        p {
                                            color: #b9b4d6;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="card">
                                        <h1>Wrong password</h1>
                                        <p>Please try again.</p>
                                        <a href="/admin" style="color:#38bdf8;">Back to login</a>
                                    </div>
                                </body>
                            </html>
                        `, {
                            status: 401,
                            headers: {
                                "Content-Type": "text/html"
                            }
                        });
                    }
                    await env.ROOM_STATUS.delete(attemptsKey);
                    const token = crypto.randomUUID();

                    await env.ROOM_STATUS.put(`session:${token}`, "authenticated", {
                        expirationTtl: 86400
                    });

                    return new Response(null, {
                        status: 302,
                        headers: {
                            "Set-Cookie": `session=${token}; HttpOnly; SameSite=Strict; Path=/admin; Max-Age=86400${url.protocol === "https:" ? "; Secure" : ""}`,
                            "Location": "/admin"
                        }
                    });
                }

                if (!isLoggedIn) {
                    return new Response("Unauthorized", { status: 401 });
                }
                if (formData.get("logout")) {
                    await env.ROOM_STATUS.delete(`session:${sessionToken}`);
                    return new Response(null, {
                        status: 302,
                        headers: {
                            "Set-Cookie": `session=; HttpOnly; SameSite=Strict; Path=/admin; Max-Age=0${url.protocol === "https:" ? "; Secure" : ""}`,
                            "Location": "/admin"
                        }
                    });
                }

                const newStatus = formData.get("status");

                if (
                    newStatus === "sleeping" ||
                    newStatus === "busy" ||
                    newStatus === "awake"
                ) {
                    await env.ROOM_STATUS.put("status", newStatus);

                    return new Response(`
                        <html>
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <meta http-equiv="refresh" content="1;url=/admin">
                                <title>Status Updated</title>
                            </head>
                            <body style="
                                margin:0;
                                min-height:100vh;
                                display:flex;
                                justify-content:center;
                                align-items:center;
                                background:#171329;
                                color:#f8f7ff;
                                font-family:Arial,sans-serif;
                            ">
                                <div style="text-align:center;">
                                    <h1>Status updated ✓</h1>
                                    <p style="color:#b9b4d6;">Returning to controls...</p>
                                </div>
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

            if (!isLoggedIn) {
                return new Response(`
                    <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">

                            <title>Room Status Admin</title>

                            <style>
                                * {
                                    box-sizing: border-box;
                                }

                                body {
                                    margin: 0;
                                    min-height: 100vh;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    padding: 20px;
                                    background:
                                        radial-gradient(circle at top, #302566, #171329 60%);
                                    color: #f8f7ff;
                                    font-family: Arial, sans-serif;
                                }

                                .card {
                                    width: 100%;
                                    max-width: 400px;
                                    padding: 35px;
                                    background: rgba(36, 27, 75, 0.92);
                                    border: 1px solid rgba(255,255,255,0.08);
                                    border-radius: 28px;
                                    box-shadow: 0 25px 70px rgba(0,0,0,0.4);
                                    text-align: center;
                                }

                                .icon {
                                    font-size: 48px;
                                    margin-bottom: 10px;
                                }

                                h1 {
                                    margin: 0 0 8px;
                                    font-size: 28px;
                                }

                                .subtitle {
                                    margin-bottom: 28px;
                                    color: #aaa5c7;
                                }

                                input {
                                    width: 100%;
                                    padding: 14px 16px;
                                    border: none;
                                    border-radius: 12px;
                                    background: #171329;
                                    color: white;
                                    font-size: 16px;
                                    outline: none;
                                }

                                input:focus {
                                    box-shadow: 0 0 0 2px #38bdf8;
                                }

                                button {
                                    width: 100%;
                                    margin-top: 14px;
                                    padding: 14px;
                                    border: none;
                                    border-radius: 12px;
                                    background: #4f46e5;
                                    color: white;
                                    font-size: 16px;
                                    font-weight: bold;
                                    cursor: pointer;
                                }

                                button:hover {
                                    opacity: 0.9;
                                }
                            </style>
                        </head>

                        <body>
                            <div class="card">
                                <div class="icon">🔐</div>

                                <h1>Room Status</h1>

                                <div class="subtitle">
                                    Private control panel
                                </div>

                                <form method="POST">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter password"
                                        required
                                    >

                                    <button type="submit">
                                        Login
                                    </button>
                                </form>
                            </div>
                        </body>
                    </html>
                `, {
                    headers: {
                        "Content-Type": "text/html"
                    }
                });
            }

            return new Response(`
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">

                        <title>Room Status Control</title>

                        <style>
                            * {
                                box-sizing: border-box;
                            }

                            body {
                                margin: 0;
                                min-height: 100vh;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                padding: 20px;

                                background:
                                    radial-gradient(circle at top, #302566, #171329 65%);

                                color: #f8f7ff;
                                font-family: Arial, sans-serif;
                            }

                            .card {
                                width: 100%;
                                max-width: 430px;
                                padding: 32px;

                                background: rgba(36, 27, 75, 0.92);
                                border: 1px solid rgba(255,255,255,0.08);
                                border-radius: 28px;

                                box-shadow:
                                    0 25px 70px rgba(0,0,0,0.4);
                            }

                            h1 {
                                margin: 0;
                                font-size: 30px;
                            }

                            .subtitle {
                                margin-top: 8px;
                                margin-bottom: 28px;
                                color: #aaa5c7;
                            }

                            button {
                                width: 100%;
                                margin-top: 12px;
                                padding: 16px;

                                border: none;
                                border-radius: 14px;

                                color: white;
                                background: #241b4b;

                                font-size: 17px;
                                font-weight: bold;

                                cursor: pointer;

                                transition: transform 0.15s, opacity 0.15s;
                            }

                            button:hover {
                                transform: translateY(-2px);
                                opacity: 0.9;
                            }

                            .sleep {
                                border: 1px solid #6366f1;
                            }

                            .busy {
                                border: 1px solid #f97373;
                            }

                            .awake {
                                border: 1px solid #38bdf8;
                            }
                        </style>
                    </head>

                    <body>
                        <div class="card">

                            <h1>Room Status</h1>

                            <div class="subtitle">
                                Update your current status
                            </div>

                            <form method="POST">
                                <button class="sleep" type="submit" name="status" value="sleeping">
                                    😴 Sleeping
                                </button>

                                <button class="busy" type="submit" name="status" value="busy">
                                    🟠 Busy
                                </button>

                                <button class="awake" type="submit" name="status" value="awake">
                                    🟢 Awake
                                </button>
                            </form>
                            <form method="POST">
                                <button type="submit" name="logout" value="1">Log out</button>
                            </form>

                        </div>
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

        let emoji = "";
        let title = "";
        let message = "";

        if (status === "sleeping") {
            emoji = "😴";
            title = "Sleeping";
            message = "Please don't knock unless it's important.";
        } else if (status === "busy") {
            emoji = "🟠";
            title = "Busy";
            message = "Knock only if it's important.";
        } else if (status === "awake") {
            emoji = "🟢";
            title = "Awake";
            message = "You may knock!";
        } else {
            emoji = "👋";
            title = "Hey!";
            message = "Room status hasn't been set yet.";
        }

        return new Response(`
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">

                    <title>Room Status</title>

                    <style>
                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            min-height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 20px;

                            background: #241B4B;
                            color: #FAF9FA;

                            font-family: Arial, sans-serif;
                        }

                        .card {
                            width: 100%;
                            max-width: 360px;

                            padding: 40px 25px;

                            text-align: center;

                            background: #30255C;
                            border-radius: 20px;
                        }

                        .label {
                            font-size: 13px;
                            color: #AAA5C7;
                            margin-bottom: 25px;
                        }

                        .emoji {
                            font-size: 65px;
                            margin-bottom: 15px;
                        }

                        h1 {
                            margin: 0;
                            font-size: 32px;
                            font-weight: 600;
                        }

                        .message {
                            margin-top: 12px;
                            color: #D0CCE0;
                            font-size: 16px;
                            line-height: 1.5;
                        }

                        @media (max-width: 400px) {
                            .card {
                                padding: 35px 20px;
                            }

                            .emoji {
                                font-size: 58px;
                            }

                            h1 {
                                font-size: 28px;
                            }
                        }
                    </style>
                </head>

                <body>

                    <div class="card">

                        <div class="label">
                            Room status
                        </div>

                        <div class="emoji">
                            ${emoji}
                        </div>

                        <h1>
                            ${title}
                        </h1>

                        <div class="message">
                            ${message}
                        </div>

                    </div>

                </body>
            </html>
                        `, {
            headers: {
                "Content-Type": "text/html"
            }
        });
    },
};
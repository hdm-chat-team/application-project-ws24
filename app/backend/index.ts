import { createBunWebSocket } from "hono/bun";
import app from "#api/app";
import env from "#env";
import { setServer } from "#lib/utils";

// * Setup
const { websocket } = createBunWebSocket();

// * Server start up
export const server = Bun.serve({
	port: env.PORT,
	fetch: app.fetch,
	websocket,
});

setServer(server);
console.log(`Server is running at ${server.url}`);

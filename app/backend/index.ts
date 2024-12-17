import { createBunWebSocket } from "hono/bun";
import env from "#env";
import app from "./app";

// * Setup
const { websocket } = createBunWebSocket();

// * Server start up
export const server = Bun.serve({
	port: env.PORT,
	fetch: app.fetch,
	websocket,
});

console.log(`Server is running at ${server.url}`);

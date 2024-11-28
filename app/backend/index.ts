import { createBunWebSocket } from "hono/bun";
import env from "#env";
import type { ChatSocket } from "#lib/types";
import app from "./app";

// * Setup
const { websocket } = createBunWebSocket<ChatSocket>();

// * Server start up
const server = Bun.serve({
	port: env.PORT,
	fetch: app.fetch,
	websocket,
});

console.log(`Server is running at ${server.url}`);

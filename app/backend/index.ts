import { createBunWebSocket } from "hono/bun";
import type { ChatSocket } from "#lib/types";
import app from "./app";

// * Setup
const { websocket } = createBunWebSocket<ChatSocket>();

// * Server start up
const server = Bun.serve({
	port: 3000,
	fetch: app.fetch,
	websocket,
});

console.log(`Server is running at ${server.url}`);

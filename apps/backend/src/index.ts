import type { ChatSocket } from "./lib/types";
import { createBunWebSocket } from "hono/bun";
import app from "./app";

// * Setup
export const { websocket } = createBunWebSocket<ChatSocket>();

const { PORT } = Bun.env;

// * Server start up
const server = Bun.serve({
	port: PORT ?? 3000,
	fetch: app.fetch,
	websocket,
});

console.log(`Server is running at ${server.url}`);

import readline from "node:readline";
import { createBunWebSocket } from "hono/bun";
import app from "./app";

// * Setup
const { websocket } = createBunWebSocket();

const { PORT } = Bun.env;
const port = PORT ?? 3000;

// * server start up
const server = Bun.serve({
	port,
	fetch: app.fetch,
	websocket,
});

console.log(`Server is running at ${server.url}`);

import readline from "node:readline";
import { createBunWebSocket } from "hono/bun";
import app from "./app";

// * Setup
const { websocket } = createBunWebSocket();

const { PORT } = Bun.env;
const port = PORT ?? 3000;

const SHUTDOWN_DELAY_MS = 10000;
let isShuttingDown = false;

// * server start up
const server = Bun.serve({
	port,
	fetch: (request) =>
		isShuttingDown
			? new Response("Server is shutting down", { status: 503 })
			: app.fetch(request),
	websocket,
});

console.log(`Server is running at ${server.url}`);

// * shutdown handling
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

readline
	.createInterface({
		input: process.stdin,
		output: process.stdout,
	})
	.on("line", (input) => {
		// listen for "q" to shutdown
		if (input.trim().toLowerCase() === "q") {
			gracefulShutdown();
		}
	});

function gracefulShutdown() {
	console.log(`Shutting down in ${SHUTDOWN_DELAY_MS / 1000}s...`);
	isShuttingDown = true;
	setTimeout(() => {
		console.log("Server closed.");
		process.exit(0);
	}, SHUTDOWN_DELAY_MS);
}

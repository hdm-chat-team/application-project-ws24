import readline from "node:readline";
import app from "./app";

const SHUTDOWN_DELAY_MS = 10000;
let isShuttingDown = false;

// * server start up
const server = Bun.serve({
	port: 3000,
	fetch: (req) =>
		isShuttingDown
			? new Response("Server is shutting down", { status: 503 })
			: app.fetch(req),
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

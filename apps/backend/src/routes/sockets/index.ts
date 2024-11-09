import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";

const { upgradeWebSocket } = createBunWebSocket();

export const ws = new Hono().get(
	"/",
	upgradeWebSocket(() => {
		return {
			onMessage(event, ws) {
				console.log(`Message from client: ${event.data}`);
				ws.send("Hello from server!");
			},
			onClose: () => {
				console.log("Connection closed");
			},
		};
	}),
);

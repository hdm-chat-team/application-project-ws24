import type { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#lib/factory";
import { protectedRoute } from "#lib/middleware";

const { upgradeWebSocket } = createBunWebSocket();

export const socketRouter = createRouter().get(
	"/",
	protectedRoute,
	upgradeWebSocket((c) => {
		return {
			onOpen: (_, ws) => {
				const socket = ws.raw as ServerWebSocket;
				const { id } = c.get("user");

				socket.subscribe(id);
				console.log("Client connected");
			},
			onClose: (_, ws) => {
				const socket = ws.raw as ServerWebSocket;
				const { id } = c.get("user");

				socket.unsubscribe(id);
				console.log("Client disconnected");
			},
		};
	}),
);

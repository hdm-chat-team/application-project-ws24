import type { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#api/factory";
import { protectedRoute } from "#lib/middleware";

const { upgradeWebSocket } = createBunWebSocket();

export const socketRouter = createRouter().get(
	"/",
	protectedRoute,
	upgradeWebSocket(async (c) => {
		const { id, username } = c.get("user");
		return {
			onOpen: async (_, ws) => {
				const socket = ws.raw as ServerWebSocket;

				socket.subscribe(id);

				console.log(`${username} connected`);
			},
			onClose: (_, ws) => {
				const socket = ws.raw as ServerWebSocket;

				socket.unsubscribe(id);
				
				console.log(`${username} disconnected`);
			},
		};
	}),
);

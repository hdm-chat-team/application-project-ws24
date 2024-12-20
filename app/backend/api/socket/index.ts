import type { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import type { User } from "#db/users";
import { createRouter } from "#api/factory";
import { protectedRoute } from "#lib/middleware";

const { upgradeWebSocket } = createBunWebSocket();

export const socketRouter = createRouter().get(
	"/",
	protectedRoute,
	upgradeWebSocket((c) => {
		return {
			onOpen: (_, ws) => {
				const socket = ws.raw as ServerWebSocket;
				const { id, username } = c.get("user") as User;

				socket.subscribe(id);
				console.log(`${username} connected`);
			},
			onClose: (_, ws) => {
				const socket = ws.raw as ServerWebSocket;
				const { id, username } = c.get("user") as User;

				socket.unsubscribe(id);
				console.log(`${username} disconnected`);
			},
		};
	}),
);

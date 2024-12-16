import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#lib/factory";
import type { ChatSocket } from "#lib/types";
import { protectedRoute } from "#lib/middleware";

const { upgradeWebSocket } = createBunWebSocket<ChatSocket>();

const topic = "chat";

export const chatRouter = createRouter().get(
	"/",
	protectedRoute,
	upgradeWebSocket((c) => {
		return {
			onOpen: (_, ws) => {
				const user = c.get("user");
				const rawWs = ws.raw;
				if (rawWs) {
					rawWs.data.user = user;
					const message = `${rawWs.data.user.username} joined the chat`;
					rawWs.subscribe(topic);
					rawWs.publish(topic, message);
				}
			},
			onMessage: (event, ws) => {
				const rawWs = ws.raw;
				if (rawWs) {
					const message = `${rawWs.data.user.username}: ${event.data}`;
					rawWs.send(message);
					rawWs.publish(topic, message);
				}
			},
			onClose: (_, ws) => {
				const rawWs = ws.raw;
				if (rawWs) {
					const message = `${rawWs.data.user.username} left the chat`;
					rawWs.publish(topic, message);
				}
			},
		};
	}),
);

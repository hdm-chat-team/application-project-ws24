import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";

const { upgradeWebSocket } =
	createBunWebSocket<ServerWebSocket<{ user: string }>>();

const topic = "chat";

export const ws = new Hono().get(
	"/",
	upgradeWebSocket((c) => {
		return {
			onOpen: (_, ws) => {
				const clientId = c.get("requestId");
				const rawWs = ws.raw;
				if (rawWs) {
					rawWs.data.user = clientId;
					const message = `${rawWs.data.user} joined the chat`;
					rawWs.subscribe(topic);
					rawWs.publish(topic, message);
				}
			},
			onMessage: (event, ws) => {
				const rawWs = ws.raw;
				const message = `${rawWs?.data.user}: ${event.data}`;
				// Send to self first
				rawWs?.send(message);
				// Then publish to others
				rawWs?.publish(topic, message);
			},
			onClose: (_, ws) => {
				const rawWs = ws.raw;
				const message = `${rawWs?.data.user} left the chat`;
				rawWs?.publish(topic, message);
			},
		};
	}),
);

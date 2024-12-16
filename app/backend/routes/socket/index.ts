import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#lib/factory";
import type { ChatSocket } from "#lib/types";
import { protectedRoute } from "#lib/middleware";
import { chatRouter } from "./chat";

const { upgradeWebSocket } = createBunWebSocket<ChatSocket>();
const clients = new Set<ChatSocket>();

export const socketRouter = createRouter()
	.route("/chat", chatRouter)
	.get(
		"/",
		protectedRoute,
		upgradeWebSocket(() => {
			return {
				onOpen: (_, ws) => {
					const { raw } = ws;
					if (raw) {
						clients.add(raw);
						console.log("Client connected");
					}
					ws.send("Welcome!");
				},
				onMessage: (/* event, ws */) => {
					/* // Broadcast message to all other clients
				const { raw } = ws;
				const data = JSON.parse(String(event));
				for (const client of clients) {
					if (raw) {
						client.send(JSON.stringify(data));
					}
				} */
				},
				onClose: (_, ws) => {
					const { raw } = ws;
					if (raw) {
						clients.delete(raw);
						console.log("Client disconnected");
					}
				},
			};
		}),
	);

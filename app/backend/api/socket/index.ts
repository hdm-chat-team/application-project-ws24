import type { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#api/factory";
import { selectChatIdsByUserId } from "#db/chats";
import { protectedRoute } from "#lib/middleware";

const { upgradeWebSocket } = createBunWebSocket();

export const socketRouter = createRouter().get(
	"/",
	protectedRoute,
	upgradeWebSocket(async (c) => {
		const { id, username } = c.get("user");
		const chats = await selectChatIdsByUserId.execute({ id });
		return {
			onOpen: async (_, ws) => {
				const socket = ws.raw as ServerWebSocket;

				// * Subscribe to personal and chat channels
				socket.subscribe(id);
				for (const { chatId } of chats) {
					socket.subscribe(chatId);
				}

				console.log(
					`${username} connected to ${chats.length} chat${chats.length > 1 ? "s" : ""}`,
				);
			},
			onClose: (_, ws) => {
				const socket = ws.raw as ServerWebSocket;

				socket.unsubscribe(id);
				for (const { chatId } of chats) {
					socket.unsubscribe(chatId);
				}
				console.log(`${username} disconnected`);
			},
		};
	}),
);

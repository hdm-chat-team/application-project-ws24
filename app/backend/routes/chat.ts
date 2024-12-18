import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import type { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#lib/factory";
import { protectedRoute } from "#lib/middleware";
import { getServer } from "#lib/utils";
import {
	createMessage,
	messageFormSchema,
	stringifyMessage,
} from "#shared/message";

const { upgradeWebSocket } = createBunWebSocket();

const topic = "chat";

export const chatRouter = createRouter()
	.get(
		"/",
		protectedRoute,
		upgradeWebSocket((c) => {
			return {
				onOpen: (_, ws) => {
					const user = c.get("user");
					const socket = ws.raw as ServerWebSocket;

					const message = JSON.stringify({
						type: "entry",
						content: `${user.username} joined the chat`,
					});
					socket.subscribe(topic);
					socket.publish(topic, message);
				},
				onMessage: (event, ws) => {
					const socket = ws.raw as ServerWebSocket;

					socket.publish(topic, event.data);
					socket.send(event.data);
				},
				onClose: (_, ws) => {
					const socket = ws.raw as ServerWebSocket;
					const user = c.get("user");

					const message = JSON.stringify({
						type: "exit",
						content: `${user.username} left the chat`,
					});
					socket.publish(topic, message);
				},
			};
		}),
	)
	.post(
		"/:id",
		zValidator("param", cuidParamSchema),
		zValidator("form", messageFormSchema),
		protectedRoute,
		async (c) => {
			const { body } = c.req.valid("form");
			const { id: topic } = c.req.valid("param");
			const { id: userId } = c.get("user");

			const message = createMessage(userId, body);
			getServer().publish(topic, stringifyMessage(message));

			return c.text("Message sent");
		},
	);

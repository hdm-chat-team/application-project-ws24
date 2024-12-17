import { createId, isCuid, length } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import type { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { z } from "zod";
import { createRouter } from "#lib/factory";
import { protectedRoute } from "#lib/middleware";
import { getServer } from "#lib/utils";

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
		"/:recipientId",
		zValidator(
			"param",
			z.object({ recipientId: z.string().length(length).refine(isCuid) }),
		),
		zValidator(
			"form",
			z.object({
				content: z.string().min(1),
			}),
		),
		protectedRoute,
		async (c) => {
			const { content } = c.req.valid("form");
			const { recipientId } = c.req.valid("param");
			const user = c.get("user");

			getServer().publish(
				recipientId,
				JSON.stringify({
					type: "message",
					content: {
						id: createId(),
						content,
						timestamp: Date.now(),
						userId: user.id,
					},
				}),
			);

			return c.text("Message sent");
		},
	);

import { createId } from "@application-project-ws24/cuid";
import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#lib/factory";
import { protectedRoute } from "#lib/middleware";
import type { ServerWebSocket } from "bun";
import { server } from "..";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

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
			"form",
			z.object({
				content: z.string().min(1),
			}),
		),
		protectedRoute,
		async (c) => {
			const content = await c.req.formData();
			const recipientId = c.req.param("recipientId");
			const user = c.get("user");

			server.publish(
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

import type { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#api/factory";
import db from "#db";
import {
	countDeliveredRecipientsByMessageId,
	selectMessageRecipientIdsByMessageId,
	updateMessageRecipientsStates,
	updateMessageStatus,
} from "#db/messages";
import type { User } from "#db/users";
import { protectedRoute } from "#lib/middleware";
import { getServer } from "#lib/utils";
import { wsEventDataSchema } from "#shared/types";

const { upgradeWebSocket } = createBunWebSocket();

export const socketRouter = createRouter().get(
	"/",
	protectedRoute,
	upgradeWebSocket(async (c) => {
		const user = c.get("user") as User;
		return {
			onOpen: async (_, ws) => {
				const socket = ws.raw as ServerWebSocket;

				socket.subscribe(user.id);

				console.log(`${user.username} connected`);
			},
			onMessage: async (event) => {
				const server = getServer();
				const data = wsEventDataSchema.parse(JSON.parse(event.data));

				switch (data.type) {
					case "message_received": {
						const { id: messageId, authorId } = data.payload;

						const fullyDelivered = await db.transaction(async (trx) => {
							await updateMessageRecipientsStates(
								messageId,
								[user.id],
								"delivered",
								trx,
							);

							const recipientIds = await selectMessageRecipientIdsByMessageId(
								messageId,
								trx,
							);

							const deliveredCount = await countDeliveredRecipientsByMessageId(
								messageId,
								trx,
							);

							if (deliveredCount === recipientIds.length) {
								await updateMessageStatus(messageId, "delivered", trx);
								return true;
							}
							return false;
						});

						if (fullyDelivered)
							server.publish(
								authorId,
								JSON.stringify({
									type: "message_delivered",
									payload: messageId,
								}),
							);

						break;
					}
					default:
						break;
				}
			},
			onClose: (_, ws) => {
				const socket = ws.raw as ServerWebSocket;

				socket.unsubscribe(user.id);

				console.log(`${user.username} disconnected`);
			},
		};
	}),
);

import type { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#api/factory";
import db from "#db";
import {
	countRecipientsByMessageState,
	selectMessageRecipientIdsByMessageId,
	selectMessagesToSync,
	updateMessageRecipientsStates,
	updateMessageStatus,
} from "#db/messages";
import type { User } from "#db/users";
import { protectedRoute } from "#lib/middleware";
import { publish, send } from "#lib/utils";
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

				// * Sync messages
				const messages = await selectMessagesToSync(user.id);
				if (messages.length === 0) return;

				const messagesByChat = Map.groupBy(
					messages,
					(message) => message.chatId,
				);

				for (const messages of messagesByChat.values()) {
					send(ws, { type: "message_sync", payload: messages });
				}
			},
			onMessage: async (event) => {
				const data = wsEventDataSchema.parse(JSON.parse(event.data));

				switch (data.type) {
					case "message_received": {
						const { id: messageId, authorId } = data.payload;

						await db.transaction(async (trx) => {
							await updateMessageRecipientsStates(
								messageId,
								[user.id],
								"delivered",
								trx,
							);

							const recipientIds = await selectMessageRecipientIdsByMessageId
								.execute({
									messageId,
								})
								.then((rows) => rows.map(({ recipientId }) => recipientId));

							const deliveredCount = await countRecipientsByMessageState(
								messageId,
								"delivered",
								trx,
							);

							if (deliveredCount === recipientIds.length) {
								await updateMessageStatus(messageId, "delivered", trx);

								publish(authorId, {
									type: "message_delivered",
									payload: messageId,
								});
							}
						});

						break;
					}
					case "message_read": {
						const { id: messageId, authorId } = data.payload;

						await db.transaction(async (trx) => {
							await updateMessageRecipientsStates(
								messageId,
								[user.id],
								"read",
								trx,
							);

							const recipientIds = await selectMessageRecipientIdsByMessageId
								.execute({
									messageId,
								})
								.then((rows) => rows.map(({ recipientId }) => recipientId));

							const readCount = await countRecipientsByMessageState(
								messageId,
								"read",
								trx,
							);

							if (readCount === recipientIds.length) {
								await updateMessageStatus(messageId, "read", trx);

								publish(authorId, {
									type: "message_completed",
									payload: messageId,
								});
							}
						});

						break;
					}
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

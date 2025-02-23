import type { ServerWebSocket } from "bun";
import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#api/factory";
import db from "#db";
import { selectChatsByUserDeviceLastSyncedAt } from "#db/chats";
import { selectLastSyncedAtByUserDevice } from "#db/devices";
import {
	countRecipientsByMessageState,
	selectMessageRecipientIdsByMessageId,
	selectMessagesByUserDeviceLastSyncedAt,
	updateMessageRecipientsStates,
	updateMessageStatus,
} from "#db/messages";
import type { Session } from "#db/sessions";
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
		const session = c.get("session") as Session;
		return {
			onOpen: async (_, ws) => {
				// Subscribe to user channel
				const socket = ws.raw as ServerWebSocket;
				socket.subscribe(user.id);

				// Select last synced at
				const lastSyncedAt = await selectLastSyncedAtByUserDevice
					.execute({ userId: user.id, deviceId: session.deviceId })
					.then((row) => row?.lastSyncedAt);

				if (!lastSyncedAt) return;

				// Sync chats
				const chats = await selectChatsByUserDeviceLastSyncedAt
					.execute({
						userId: user.id,
						lastSyncedAt,
					})
					.then((rows) =>
						rows.map((row) => ({
							...row,
							members: row.members.map((member) => member.userId),
						})),
					);

				for (const chat of chats)
					send(ws, {
						type: "sync:chats",
						payload: chat,
					});

				// Sync messages
				const messages = await selectMessagesByUserDeviceLastSyncedAt.execute({
					lastSyncedAt,
				});

				for (const message of messages)
					send(ws, { type: "sync:messages", payload: message });
			},
			onMessage: async (event) => {
				const data = wsEventDataSchema.parse(JSON.parse(event.data));

				switch (data.type) {
					case "message:received": {
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
									type: "message:delivered",
									payload: messageId,
								});
							}
						});

						break;
					}
					case "message:read": {
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
									type: "message:completed",
									payload: messageId,
								});
							}
						});

						break;
					}
				}
			},
			onClose: (_, ws) => {
				// Unsubscribe from user channel
				const socket = ws.raw as ServerWebSocket;
				socket.unsubscribe(user.id);
			},
		};
	}),
);

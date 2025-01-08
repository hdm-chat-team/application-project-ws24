import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import db from "#db";
import { selectChatWithMembersByUserId } from "#db/chats";
import {
	insertMessage,
	insertMessageRecipients,
	insertMessageSchema,
} from "#db/messages";
import { messageRecipientTable } from "#db/messages.sql";
import { protectedRoute } from "#lib/middleware";
import { getServer } from "#lib/utils";

export const chatRouter = createRouter().post(
	"/",
	zValidator("form", insertMessageSchema),
	protectedRoute,
	async (c) => {
		const message = c.req.valid("form");
		const server = getServer();

		await db.transaction(async (trx) => {
			const chat = await selectChatWithMembersByUserId(message.chatId, trx);

			if (!chat) throw new HTTPException(404, { message: "Chat not found" });
			if (!chat.members.some((member) => member.userId === message.authorId))
				throw new HTTPException(403, { message: "Not a chat member" });

			const [insertedMessage] = await insertMessage(trx).execute(message);

			const recipients = chat.members.map((member) => ({
				messageId: insertedMessage.id,
				recipientId: member.userId,
				state: "pending" as const,
			}));

			await trx.insert(messageRecipientTable).values(recipients);

			const deliveryResults = recipients.map((recipient) => ({
				id: recipient.recipientId,
				delivered:
					server.publish(
						recipient.recipientId,
						JSON.stringify(insertedMessage),
					) > 0,
			}));

			await insertMessageRecipients(
				insertedMessage.id,
				deliveryResults.filter((r) => r.delivered).map((r) => r.id),
				trx,
			);

			if (!deliveryResults.some((r) => r.delivered))
				throw new HTTPException(500, { message: "Message delivery failed" });
		});

		return c.json({ message: "Message sent" }, 201);
	},
);

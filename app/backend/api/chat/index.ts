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
import { protectedRoute } from "#lib/middleware";
import { publish } from "#lib/utils";

export const chatRouter = createRouter().post(
	"/",
	zValidator("form", insertMessageSchema),
	protectedRoute,
	async (c) => {
		const message = c.req.valid("form");

		const { insertedMessage, insertedRecipientIds } = await db.transaction(
			async (trx) => {
				const chat = await selectChatWithMembersByUserId(message.chatId, trx);

				if (!chat) throw new HTTPException(404, { message: "Chat not found" });
				if (!chat.members.some((member) => member.userId === message.authorId))
					throw new HTTPException(403, { message: "Not a chat member" });

				const insertedMessage = await insertMessage(
					{ ...message, state: "sent" },
					trx,
				);
				const insertedRecipientIds = await insertMessageRecipients(
					insertedMessage.id,
					chat.members.map((member) => member.userId),
					trx,
				);
				return {
					insertedMessage,
					insertedRecipientIds,
				};
			},
		);

		for (const recipientId of insertedRecipientIds)
			publish(recipientId, {
				type: "message_incoming",
				payload: insertedMessage,
			});

		return c.json({ message: "Message sent", data: insertedMessage.id }, 201);
	},
);

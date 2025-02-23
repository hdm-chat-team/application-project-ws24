import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import { selectChatWithMembersByUserId } from "#db/chats";
import {
	insertMessage,
	insertMessageRecipients,
	insertMessageSchema,
} from "#db/messages";
import { protectedRoute } from "#lib/middleware";
import { publish } from "#lib/utils";

export const messageRouter = createRouter().post(
	"/",
	zValidator("form", insertMessageSchema),
	protectedRoute,
	async (c) => {
		const message = c.req.valid("form");

		if (message.authorId !== c.get("user").id)
			throw new HTTPException(403, { message: "Not authorized" });

		const chat = await selectChatWithMembersByUserId.execute({
			userId: message.authorId,
			chatId: message.chatId,
		});

		if (!chat) throw new HTTPException(404, { message: "Chat not found" });
		if (!chat.members.some((member) => member.userId === message.authorId))
			throw new HTTPException(403, { message: "Not a chat member" });

		const insertedMessage = await insertMessage
			.execute(message)
			.then((rows) => rows[0]);

		const insertedRecipientIds = await insertMessageRecipients(
			insertedMessage.id,
			chat.members.map((member) => member.userId),
		);

		for (const recipientId of insertedRecipientIds)
			publish(recipientId, {
				type: "message:incoming",
				payload: insertedMessage,
			});

		return c.json({ message: "Message sent", data: insertedMessage.id }, 201);
	},
);

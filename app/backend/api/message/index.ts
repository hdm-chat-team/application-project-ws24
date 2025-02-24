import { zValidator } from "@hono/zod-validator";
import { createRouter } from "#api/factory";
import { selectChatWithMembersByUserId } from "#db/chats";
import {
	insertMessage,
	insertMessageRecipients,
	insertMessageSchema,
} from "#db/messages";
import { protectedRoute } from "#lib/middleware";
import { publish } from "#lib/utils";

export const messageRouter = createRouter()
	.use(protectedRoute)
	.post("/", zValidator("form", insertMessageSchema), async (c) => {
		const message = c.req.valid("form");

		if (message.authorId !== c.var.user.id)
			return c.json({ message: "Not authorized", data: null }, 403);

		const chat = await selectChatWithMembersByUserId.execute({
			userId: message.authorId,
			chatId: message.chatId,
		});

		if (!chat) return c.json({ message: "Chat not found", data: null }, 404);
		if (!chat.members.some((member) => member.userId === message.authorId))
			return c.json({ message: "Not a Chat member", data: null }, 403);

		const [insertedMessage] = await insertMessage.execute(message);

		const insertedRecipientIds = await insertMessageRecipients(
			insertedMessage.id,
			chat.members.map((member) => member.userId),
		);

		for (const recipientId of insertedRecipientIds)
			publish(recipientId, {
				type: "message",
				payload: insertedMessage,
			});

		return c.json({ message: "Message sent", data: insertedMessage.id }, 201);
	});

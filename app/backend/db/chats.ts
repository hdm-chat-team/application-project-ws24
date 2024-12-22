import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import db from "#db";
import { chatMemberTable, chatTable } from "./chats.sql";
import type { User } from "./users";

const insertChatSchema = createInsertSchema(chatTable);
const selectChatSchema = createSelectSchema(chatTable);
type Chat = z.infer<typeof selectChatSchema>;

function insertSelfChat(user: User) {
	return db.transaction(async (tx) => {
		const existingChat = await tx.query.chatTable.findFirst({
			where: (chatTable, { eq }) => eq(chatTable.name, user.username),
		});

		if (!existingChat) {
			const newChat = await tx
				.insert(chatTable)
				.values({
					name: user.username,
				})
				.returning();
			await tx.insert(chatMemberTable).values({
				chatId: newChat[0].id,
				userId: user.id,
			});
		}
	});
}

export {
	// * Chat schemas
	insertChatSchema,
	selectChatSchema,
	// * Chat functions
	insertSelfChat,
};
export type { Chat };

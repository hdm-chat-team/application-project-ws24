import { eq, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import db from "#db";
import { chatMemberTable, chatTable } from "./chats.sql";
import type { DB, Transaction } from "./types";
import type { User } from "./users";

const insertChatSchema = createInsertSchema(chatTable);
const selectChatSchema = createSelectSchema(chatTable);
type Chat = z.infer<typeof selectChatSchema>;

const selectChatIdsByUserId = db.query.chatMemberTable
	.findMany({
		columns: { chatId: true },
		where: eq(chatMemberTable.userId, sql.placeholder("id")),
	})
	.prepare("select_chat_ids_by_user_id");

function insertSelfChat(user: User) {
	return db.transaction(async (tx) => {
		const existingChat = await tx.query.chatTable.findFirst({
			where: eq(chatTable.name, user.username),
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

async function selectChatWithMembersByUserId(
	chatId: string,
	trx: Transaction | DB = db,
) {
	return await trx.query.chatTable.findFirst({
		columns: { id: true },
		where: (chatTable, { eq }) => eq(chatTable.id, chatId),
		with: { members: { columns: { userId: true } } },
	});
}

export {
	// * Chat schemas
	insertChatSchema,
	// * Chat functions
	insertSelfChat,
	// * Chat queries
	selectChatIdsByUserId,
	selectChatSchema,
	selectChatWithMembersByUserId,
};
export type { Chat };

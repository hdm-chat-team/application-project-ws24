import { eq, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import db from "#db";
import { chatMemberTable, chatTable } from "./chats.sql";
import type { DB, Transaction } from "./types";

const insertChatSchema = createInsertSchema(chatTable);
const selectChatSchema = createSelectSchema(chatTable);
type Chat = z.infer<typeof selectChatSchema>;

const selectChatIdsByUserId = db.query.chatMemberTable
	.findMany({
		columns: { chatId: true },
		where: eq(chatMemberTable.userId, sql.placeholder("id")),
	})
	.prepare("select_chat_ids_by_user_id");

async function insertSelfChat(name: string, trx: Transaction | DB = db) {
	return await trx
		.insert(chatTable)
		.values({
			name,
		})
		.onConflictDoNothing()
		.returning({ id: chatTable.id })
		.then((rows) => rows[0].id);
}

async function insertSelfChatMembership(
	chatId: string,
	userId: string,
	trx: Transaction | DB = db,
) {
	await trx
		.insert(chatMemberTable)
		.values({
			chatId,
			userId,
		})
		.onConflictDoNothing();
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
	// * Chat queries
	insertSelfChat,
	insertSelfChatMembership,
	selectChatIdsByUserId,
	selectChatSchema,
	// * Chat functions
	selectChatWithMembersByUserId,
};
export type { Chat };

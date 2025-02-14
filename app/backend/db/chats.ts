import { cuidSchema } from "@application-project-ws24/cuid";
import { and, eq, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
import db from "#db";
import { chatMemberTable, chatTable } from "./chats.sql";
import type { DB, Transaction } from "./types";

const insertChatSchema = createInsertSchema(chatTable, { id: cuidSchema });
const updateChatSchema = createUpdateSchema(chatTable);
const selectChatSchema = createSelectSchema(chatTable);
type Chat = z.infer<typeof selectChatSchema>;

const insertChatMemberSchema = createInsertSchema(chatMemberTable, {
	chatId: cuidSchema,
	userId: cuidSchema,
});
const selectChatMemberSchema = createSelectSchema(chatMemberTable);
type ChatMembership = z.infer<typeof selectChatMemberSchema>;

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

const insertChat = db
	.insert(chatTable)
	.values({
		id: sql.placeholder("id"),
		name: sql.placeholder("name"),
		type: sql.placeholder("type"),
	})
	.returning()
	.prepare("insert_chat");

const updateChat = db
	.update(chatTable)
	.set({ name: sql.placeholder("name").getSQL() })
	.where(eq(chatTable.id, sql.placeholder("id")))
	.returning()
	.prepare("update_chat");

const insertChatMembership = db
	.insert(chatMemberTable)
	.values({
		chatId: sql.placeholder("chatId"),
		userId: sql.placeholder("userId"),
	})
	.returning()
	.prepare("insert_chat_member");

const deleteChatMembership = db
	.delete(chatMemberTable)
	.where(
		and(
			eq(chatMemberTable.chatId, sql.placeholder("chatId")),
			eq(chatMemberTable.userId, sql.placeholder("userId")),
		),
	)
	.returning()
	.prepare("delete_chat");

const selectUserSelfChat = db.query.chatTable
	.findFirst({
		columns: { id: true },
		where: eq(chatTable.type, "self"),
		with: {
			members: {
				columns: { userId: true },
				where: (chatMemberTable, { eq }) =>
					eq(chatMemberTable.userId, sql.placeholder("userId")),
			},
		},
	})
	.prepare("select_user_self_chat");

const selectChatMembership = db.query.chatMemberTable
	.findFirst({
		where: (chatMemberTable, { and, eq }) =>
			and(
				eq(chatMemberTable.chatId, sql.placeholder("chatId")),
				eq(chatMemberTable.userId, sql.placeholder("userId")),
			),
	})
	.prepare("select_chat_member");

export {
	deleteChatMembership,
	// * Chat queries
	insertChat,
	insertChatMemberSchema,
	insertChatMembership,
	updateChatSchema,
	selectUserSelfChat,
	selectChatMembership,
	// * Chat schemas
	insertChatSchema,
	updateChat,
	selectChatSchema,
	// * Chat functions
	selectChatWithMembersByUserId,
};
export type { Chat, ChatMembership };

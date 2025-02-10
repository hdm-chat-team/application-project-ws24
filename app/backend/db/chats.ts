import { cuidSchema } from "@application-project-ws24/cuid";
import { and, eq, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import db from "#db";
import { chatMembershipTable, chatTable } from "./chats.sql";
import type { DB, Transaction } from "./types";

const insertChatSchema = createInsertSchema(chatTable, { id: cuidSchema });
const updateChatSchema = createUpdateSchema(chatTable, {
	name: z.string().nonempty(),
});
const selectChatSchema = createSelectSchema(chatTable);
type Chat = z.infer<typeof selectChatSchema>;

const insertChatMembershipSchema = createInsertSchema(chatMembershipTable, {
	chatId: cuidSchema,
	userId: cuidSchema,
});
const selectChatMembershipSchema = createSelectSchema(chatMembershipTable);
type ChatMembership = z.infer<typeof selectChatMembershipSchema>;

async function selectChatWithMembersByUserId(
	chatId: string,
	trx: Transaction | DB = db,
) {
	return await trx.query.chatTable.findFirst({
		columns: { id: true },
		where: eq(chatTable.id, chatId),
		with: { members: { columns: { userId: true } } },
	});
}

const insertChat = db
	.insert(chatTable)
	.values({
		id: sql.placeholder("id"),
		name: sql.placeholder("name"),
		type: sql.placeholder("type"),
		createdAt: sql.placeholder("createdAt"),
		updatedAt: sql.placeholder("updatedAt"),
	})
	.returning()
	.prepare("insert_chat");

const updateChat = db
	.update(chatTable)
	.set({ name: sql.placeholder("name").getSQL() })
	.where(eq(chatTable.id, sql.placeholder("id")))
	.returning()
	.prepare("update_chat");

const insertSelfChat = db
	.insert(chatTable)
	.values({
		type: "self",
	})
	.returning({ id: chatTable.id })
	.prepare("insert_self_chat");

const selectUserSelfChat = db.query.chatTable
	.findFirst({
		columns: { id: true },
		where: eq(chatTable.type, "self"),
		with: {
			members: {
				where: eq(chatMembershipTable.userId, sql.placeholder("userId")),
			},
		},
	})
	.prepare("select_user_self_chat");

const insertChatMembership = db
	.insert(chatMembershipTable)
	.values({
		chatId: sql.placeholder("chatId"),
		userId: sql.placeholder("userId"),
	})
	.returning()
	.prepare("insert_chat_membership");

const selectChatMembership = db.query.chatMembershipTable
	.findFirst({
		where: and(
			eq(chatMembershipTable.chatId, sql.placeholder("chatId")),
			eq(chatMembershipTable.userId, sql.placeholder("userId")),
		),
	})
	.prepare("select_chat_membership");

const deleteChatMembership = db
	.delete(chatMembershipTable)
	.where(
		and(
			eq(chatMembershipTable.chatId, sql.placeholder("chatId")),
			eq(chatMembershipTable.userId, sql.placeholder("userId")),
		),
	)
	.returning()
	.prepare("delete_chat_membership");

export {
	// * Chat queries
	insertChat,
	insertSelfChat,
	updateChat,
	deleteChatMembership,
	insertChatMembership,
	updateChatSchema,
	selectUserSelfChat,
	selectChatMembership,
	// * Chat schemas
	insertChatSchema,
	selectChatSchema,
	insertChatMembershipSchema,
	selectChatMembershipSchema,
	// * Chat functions
	selectChatWithMembersByUserId,
};
export type { Chat, ChatMembership };

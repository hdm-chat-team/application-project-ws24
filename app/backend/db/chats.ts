import { cuidSchema } from "@application-project-ws24/cuid";
import { and, eq, or, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import db from "#db";
import { chatMembershipTable, chatTable } from "./chats.sql";

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

const insertGroupChatWithMembershipsSchema = z.object({
	chat: insertChatSchema.extend({
		name: z.string().nonempty(),
		type: z.literal(insertChatSchema.shape.type.enum.group),
	}),
	memberships: z
		.array(insertChatMembershipSchema)
		.min(1, "Group chats must have at least one member"),
});

type GroupChatWithMemberships = z.infer<
	typeof insertGroupChatWithMembershipsSchema
>;

const selectChatWithMembersByUserId = db.query.chatTable
	.findFirst({
		columns: { id: true },
		where: eq(chatTable.id, sql.placeholder("chatId")),
		with: {
			members: {
				columns: { userId: true },
				where: eq(chatMembershipTable.userId, sql.placeholder("userId")),
			},
		},
	})
	.prepare("select_chat_with_members_by_user_id");

const insertSelfChat = db
	.insert(chatTable)
	.values({
		type: "self",
		createdAt: sql`now()`,
		updatedAt: sql`now()`,
	})
	.returning({ id: chatTable.id })
	.prepare("upsert_self_chat");

const upsertSelfChatWithMembership = db
	.insert(chatMembershipTable)
	.values({
		chatId: sql.placeholder("chatId"),
		userId: sql.placeholder("userId"),
		role: "owner",
		joinedAt: sql`now()`,
	})
	.onConflictDoNothing({
		target: [chatMembershipTable.chatId, chatMembershipTable.userId],
	})
	.prepare("upsert_self_chat_membership");

const insertDirectChat = db
	.insert(chatTable)
	.values({
		type: "direct",
		createdAt: sql`now()`,
		updatedAt: sql`now()`,
	})
	.returning()
	.prepare("insert_direct_chat");

const insertGroupChat = db
	.insert(chatTable)
	.values({
		id: sql.placeholder("id"),
		name: sql.placeholder("name"),
		type: sql.placeholder("type"),
		createdAt: sql.placeholder("createdAt"),
		updatedAt: sql.placeholder("updatedAt"),
	})
	.returning()
	.prepare("insert_group_chat");

const updateChat = db
	.update(chatTable)
	.set({ name: sql.placeholder("name").getSQL() })
	.where(eq(chatTable.id, sql.placeholder("id")))
	.returning()
	.prepare("update_chat");

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
		role: sql.placeholder("role"),
		joinedAt: sql`now()`,
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

const selectChatOwnerOrAdminMembership = db.query.chatMembershipTable
	.findFirst({
		columns: { role: true },
		where: and(
			eq(chatMembershipTable.chatId, sql.placeholder("chatId")),
			eq(chatMembershipTable.userId, sql.placeholder("userId")),
			or(
				eq(chatMembershipTable.role, "owner"),
				eq(chatMembershipTable.role, "admin"),
			),
		),
	})
	.prepare("select_chat_owner_or_admin");

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
	selectUserSelfChat,
	upsertSelfChat,
	upsertSelfChatWithMembership,
	insertDirectChat,
	insertGroupChat,
	selectChatWithMembersByUserId,
	updateChat,
	insertChatMembership,
	selectChatMembership,
	selectChatOwnerOrAdminMembership,
	deleteChatMembership,
	// * Chat schemas
	insertChatSchema,
	insertGroupChatWithMembershipsSchema,
	insertChatMembershipSchema,
	selectChatMembershipSchema,
	selectChatSchema,
	updateChatSchema,
};
export type { Chat, ChatMembership, GroupChatWithMemberships };

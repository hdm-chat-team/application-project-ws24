import { relations } from "drizzle-orm";
import {
	pgEnum,
	pgTable,
	primaryKey,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { messageTable } from "./messages.sql";
import { userTable } from "./users.sql";
import { cuid, id, timestamps } from "./utils";

export const chatTypeEnum = pgEnum("chat_type", ["self", "direct", "group"]);

export const chatTable = pgTable(
	"chats",
	{
		id,
		...timestamps,
		name: varchar({ length: 255 }),
		type: chatTypeEnum().notNull(),
	},
	(table) => [uniqueIndex().on(table.id)],
);

export const chatTableRelations = relations(chatTable, ({ many }) => ({
	members: many(chatMembershipTable),
	messages: many(messageTable),
}));

export const chatMembershipRoleEnum = pgEnum("chat_membership_role", [
	"owner",
	"admin",
	"member",
]);

export const chatMembershipTable = pgTable(
	"chats_memberships",
	{
		userId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		chatId: cuid()
			.notNull()
			.references(() => chatTable.id, { onDelete: "cascade" }),
		role: chatMembershipRoleEnum().default("member"),
		joinedAt: timestamp({ mode: "string" }).notNull().defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.chatId] })],
);

export const chatMembershipTableRelations = relations(
	chatMembershipTable,
	({ one }) => ({
		user: one(userTable, {
			fields: [chatMembershipTable.userId],
			references: [userTable.id],
		}),
		chat: one(chatTable, {
			fields: [chatMembershipTable.chatId],
			references: [chatTable.id],
		}),
	}),
);

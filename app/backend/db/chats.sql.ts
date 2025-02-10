import { relations } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	primaryKey,
	varchar,
} from "drizzle-orm/pg-core";
import { userTable } from "./users.sql";
import { cuid, id, timestamps } from "./utils";

export const chatTypeEnum = pgEnum("chat_type", ["self", "direct", "group"]);

export const chatTable = pgTable("chats", {
	id,
	...timestamps,
	name: varchar({ length: 255 }),
	type: chatTypeEnum().notNull(),
});

export const chatRelations = relations(chatTable, ({ many }) => ({
	members: many(chatMemberTable),
}));

export const chatMemberTable = pgTable(
	"chat_members",
	{
		chatId: cuid()
			.notNull()
			.references(() => chatTable.id, { onDelete: "cascade" }),
		userId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.chatId, table.userId] }),
		index().on(table.userId),
	],
);

export const chatMemberRelations = relations(chatMemberTable, ({ one }) => ({
	chat: one(chatTable, {
		fields: [chatMemberTable.chatId],
		references: [chatTable.id],
	}),
	user: one(userTable, {
		fields: [chatMemberTable.userId],
		references: [userTable.id],
	}),
}));

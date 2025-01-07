import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { chatTable } from "./chats.sql";
import { userTable } from "./users.sql";
import { ID_SIZE_CONFIG, id, timestamps } from "./utils";

export const messageStateEnum = pgEnum("state", [
	"pending",
	"sent",
	"delivered",
	"read",
]);

export const messageTable = pgTable("messages", {
	id,
	...timestamps,
	chatId: varchar(ID_SIZE_CONFIG)
		.notNull()
		.references(() => chatTable.id),
	authorId: varchar(ID_SIZE_CONFIG)
		.notNull()
		.references(() => userTable.id),
	state: messageStateEnum().notNull(),
	body: text().notNull(),
});

export const messageTableRelations = relations(messageTable, ({ one }) => ({
	chat: one(chatTable, {
		relationName: "chat",
		fields: [messageTable.chatId],
		references: [chatTable.id],
	}),
	author: one(userTable, {
		relationName: "author",
		fields: [messageTable.authorId],
		references: [userTable.id],
	}),
}));

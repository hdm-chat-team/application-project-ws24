import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { chatTable } from "./chats.sql";
import { userTable } from "./users.sql";
import { ID_SIZE_CONFIG, id, timestamps } from "./utils";

export const messageStateEnum = pgEnum("status", [
	"pending",
	"sent",
	"delivered",
	"read",
]);

export const messageTable = pgTable("messages", {
	id,
	...timestamps,
	chatId: varchar(ID_SIZE_CONFIG).references(() => chatTable.id),
	authorId: varchar(ID_SIZE_CONFIG).references(() => userTable.id),
	status: messageStateEnum().notNull(),
	content: text().notNull(),
});

export const messageTableRelations = relations(messageTable, ({ one }) => ({
	chat: one(chatTable),
	author: one(userTable),
}));

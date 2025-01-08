import { relations } from "drizzle-orm";
import {
	pgEnum,
	pgTable,
	primaryKey,
	text,
	varchar,
} from "drizzle-orm/pg-core";
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

export const messageTableRelations = relations(
	messageTable,
	({ one, many }) => ({
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
		recipients: many(messageRecipientTable),
	}),
);

export const messageRecipientTable = pgTable(
	"message_recipients",
	{
		messageId: varchar(ID_SIZE_CONFIG)
			.notNull()
			.references(() => messageTable.id, { onDelete: "cascade" }),
		recipientId: varchar(ID_SIZE_CONFIG)
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		state: messageStateEnum().notNull(),
		...timestamps,
	},
	(table) => [
		{
			pk: primaryKey({ columns: [table.messageId, table.recipientId] }),
		},
	],
);

export const messageRecipientRelations = relations(
	messageRecipientTable,
	({ one }) => ({
		message: one(messageTable, {
			fields: [messageRecipientTable.messageId],
			references: [messageTable.id],
		}),
		recipient: one(userTable, {
			fields: [messageRecipientTable.recipientId],
			references: [userTable.id],
		}),
	}),
);

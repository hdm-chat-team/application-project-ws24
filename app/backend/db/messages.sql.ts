import { relations } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { messageAttachmentTable } from "./attachments.sql";
import { chatTable } from "./chats.sql";
import { userTable } from "./users.sql";
import { cuid, id } from "./utils";

export const messageStateEnum = pgEnum("messages_state", [
	"pending",
	"sent",
	"delivered",
	"read",
]);

export const messageTable = pgTable(
	"messages",
	{
		id,
		chatId: cuid()
			.notNull()
			.references(() => chatTable.id),
		authorId: cuid()
			.notNull()
			.references(() => userTable.id),
		state: messageStateEnum().notNull(),
		body: text(),
		createdAt: timestamp({ mode: "string" }).notNull(),
		updatedAt: timestamp({ mode: "string" }).notNull(),
	},
	(table) => [index().on(table.authorId), index().on(table.createdAt)],
);

export const messageTableRelations = relations(
	messageTable,
	({ one, many }) => ({
		chat: one(chatTable, {
			fields: [messageTable.chatId],
			references: [chatTable.id],
		}),
		author: one(userTable, {
			fields: [messageTable.authorId],
			references: [userTable.id],
		}),
		recipients: many(messageRecipientTable),
		attachments: many(messageAttachmentTable),
	}),
);

export const messageRecipientTable = pgTable(
	"messages_recipients",
	{
		messageId: cuid()
			.notNull()
			.references(() => messageTable.id, { onDelete: "cascade" }),
		recipientId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		state: messageStateEnum().notNull(),
		createdAt: timestamp({ mode: "string" }).notNull(),
		updatedAt: timestamp({ mode: "string" }).notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.messageId, table.recipientId] }),
		index().on(table.messageId),
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

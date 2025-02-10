import { relations } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { messageTable } from "./messages.sql";
import { cuid } from "./utils";

export const messageAttachmentTable = pgTable("message_attachments", {
	url: varchar({ length: 255 }).primaryKey(),
	type: text().notNull(),
	messageId: cuid()
		.references(() => messageTable.id, { onDelete: "cascade" })
		.notNull(),
});

export const messageAttachmentRelations = relations(
	messageAttachmentTable,
	({ one }) => ({
		message: one(messageTable, {
			fields: [messageAttachmentTable.messageId],
			references: [messageTable.id],
		}),
	}),
);

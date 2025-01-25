import { relations } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { messageTable } from "./messages.sql";
import { ID_SIZE_CONFIG } from "./utils";

export const messageAttachmentTable = pgTable("message_attachments", {
	url: varchar({ length: 255 }).primaryKey(),
	type: text().notNull(),
	messageId: varchar(ID_SIZE_CONFIG)
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

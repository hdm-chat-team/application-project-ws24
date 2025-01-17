import { relations } from "drizzle-orm";
import { messageTable } from "./messages.sql";
import { ID_SIZE_CONFIG } from "./utils";
import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const attachmentTypeEnum = pgEnum("type", [
	"image",
	"video",
	"audio",
	"document",
]);

export const attachmentTable = pgTable("attachments", {
	url: varchar({ length: 255 }).primaryKey(),
	type: attachmentTypeEnum("type").notNull(),
	messageId: varchar(ID_SIZE_CONFIG)
		.references(() => messageTable.id)
		.notNull(),
});

export const attachmentRelations = relations(attachmentTable, ({ one }) => ({
	message: one(messageTable, {
		fields: [attachmentTable.messageId],
		references: [messageTable.id],
	}),
}));

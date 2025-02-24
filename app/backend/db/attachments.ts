import { cuidSchema } from "@application-project-ws24/cuid";
import { eq, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import db from "#db";
import { messageAttachmentTable } from "./attachments.sql";
import type { Transaction } from "./types";
import type { DB } from "./types";

const insertAttachmentSchema = createInsertSchema(messageAttachmentTable, {
	url: z.string().url(),
	messageId: cuidSchema,
});
const selectAttachmentSchema = createSelectSchema(messageAttachmentTable);
type Attachment = z.infer<typeof selectAttachmentSchema>;

const insertAttachment = db
	.insert(messageAttachmentTable)
	.values({
		url: sql.placeholder("url"),
		type: sql.placeholder("type"),
		messageId: sql.placeholder("messageId"),
	})
	.returning()
	.prepare("insert__message_attachment");

const selectAttachmentsByMessageId = async (
	messageId: string,
	trx: Transaction | DB = db,
) =>
	await trx
		.select()
		.from(messageAttachmentTable)
		.where(eq(messageAttachmentTable.messageId, messageId));

export {
	// * Attachment queries
	insertAttachment,
	selectAttachmentsByMessageId,
	// * Attachment schemas
	insertAttachmentSchema,
	selectAttachmentSchema,
};
export type { Attachment };

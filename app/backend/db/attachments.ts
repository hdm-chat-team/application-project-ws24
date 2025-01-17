import { eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import db from "#db";
import { attachmentTable } from "./attachments.sql";
import type { Transaction } from "./types";
import type { DB } from "./types";

const insertAttachmentSchema = createInsertSchema(attachmentTable);
const selectAttachmentSchema = createSelectSchema(attachmentTable);
type Attachment = z.infer<typeof selectAttachmentSchema>;

const insertAttachment = async (
	attachment: z.infer<typeof insertAttachmentSchema>,
	trx: Transaction | DB = db,
) =>
	await trx
		.insert(attachmentTable)
		.values(attachment)
		.returning()
		.then((rows) => rows[0]);

const selectAttachmentsByMessageId = async (
	messageId: string,
	trx: Transaction | DB = db,
) =>
	await trx
		.select()
		.from(attachmentTable)
		.where(eq(attachmentTable.messageId, messageId));

export {
	// * Attachment queries
	insertAttachment,
	selectAttachmentsByMessageId,
	// * Attachment schemas
	insertAttachmentSchema,
	selectAttachmentSchema,
};
export type { Attachment };

import { eq, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
import db from "#db";
import { messageRecipientTable, messageTable } from "./messages.sql";
import type { DB, Transaction } from "./types";

const insertMessageSchema = createInsertSchema(messageTable);
const updateMessageSchema = createUpdateSchema(messageTable);
const selectMessageSchema = createSelectSchema(messageTable);
type Message = z.infer<typeof selectMessageSchema>;

const insertMessage = async (
	message: z.infer<typeof insertMessageSchema>,
	trx: Transaction | DB = db,
) =>
	await trx
		.insert(messageTable)
		.values(message)
		.returning()
		.then((rows) => rows[0]);

const deleteMessage = db
	.delete(messageTable)
	.where(eq(messageTable.id, sql.placeholder("id")))
	.prepare("delete_message");

async function updateMessageStatus(
	id: string,
	state: Pick<Message, "state">["state"],
) {
	return await db
		.update(messageTable)
		.set({
			state,
		})
		.where(eq(messageTable.id, id))
		.returning();
}

async function insertMessageRecipients(
	messageId: string,
	recipientIds: string[],
	trx: Transaction | DB = db,
) {
	return await trx
		.insert(messageRecipientTable)
		.values(
			recipientIds.map((recipientId) => ({
				messageId,
				recipientId,
				state: "pending" as const,
			})),
		)
		.returning({ recipientIds: messageRecipientTable.recipientId })
		.then((rows) => rows.map((row) => row.recipientIds));
}
}

export {
	deleteMessage,
	// * Message queries
	insertMessage,
	// * Message schemas
	insertMessageSchema,
	selectMessageSchema,
	updateMessageSchema,
	// * Message functions
	updateMessageStatus,
	insertMessageRecipients,
};
export type { Message };

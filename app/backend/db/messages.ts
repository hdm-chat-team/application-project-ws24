import { and, eq, inArray, or, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
import db from "#db";
import {
	messageRecipientTable,
	type messageStateEnum,
	messageTable,
} from "./messages.sql";
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
	trx: Transaction | DB = db,
) {
	return await trx
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

async function selectMessageRecipientIdsByMessageId(
	messageId: string,
	trx: Transaction | DB = db,
) {
	return await trx.query.messageRecipientTable
		.findMany({
			columns: { recipientId: true },
			where: eq(messageRecipientTable.messageId, messageId),
		})
		.then((rows) => rows.map((row) => row.recipientId));
}

async function countRecipientsByMessageState(
	messageId: string,
	state: (typeof messageStateEnum.enumValues)[number],
	trx: Transaction | DB = db,
) {
	return await trx.$count(
		messageRecipientTable,
		and(
			eq(messageRecipientTable.messageId, messageId),
			eq(messageRecipientTable.state, state),
		),
	);
}

async function updateMessageRecipientsStates(
	messageId: string,
	recipientIds: string[],
	state: (typeof messageStateEnum.enumValues)[number],
	trx: Transaction | DB = db,
) {
	return await trx
		.update(messageRecipientTable)
		.set({
			state,
		})
		.where(
			and(
				inArray(messageRecipientTable.recipientId, recipientIds),
				eq(messageRecipientTable.messageId, messageId),
			),
		)
		.returning({ recipientIds: messageRecipientTable.recipientId })
		.then((rows) => rows.map((row) => row.recipientIds));
}

async function pruneMessages(trx: Transaction | DB = db) {
	await trx
		.delete(messageTable)
		.where(
			or(
				and(
					eq(messageTable.state, "delivered"),
					sql`created_at < NOW() - INTERVAL '30 days'`,
				),
				eq(messageTable.state, "read"),
			),
		);
}

export {
	// * Message queries
	deleteMessage,
	// * Message functions
	selectMessageRecipientIdsByMessageId,
	insertMessageRecipients,
	countDeliveredRecipientsByMessageId,
	updateMessageRecipientsStates,
	updateMessageStatus,
	insertMessage,
	pruneMessages,
	// * Message schemas
	insertMessageSchema,
	selectMessageSchema,
	updateMessageSchema,
};
export type { Message };

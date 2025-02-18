import { cuidSchema } from "@application-project-ws24/cuid";
import { and, asc, eq, inArray, not, or, sql } from "drizzle-orm";
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

const insertMessageSchema = createInsertSchema(messageTable, {
	id: cuidSchema,
});
const updateMessageSchema = createUpdateSchema(messageTable);
const selectMessageSchema = createSelectSchema(messageTable);
type Message = z.infer<typeof selectMessageSchema>;

const insertMessage = db
	.insert(messageTable)
	.values({
		id: sql.placeholder("id"),
		authorId: sql.placeholder("authorId"),
		chatId: sql.placeholder("chatId"),
		body: sql.placeholder("body"),
		createdAt: sql.placeholder("createdAt"),
		updatedAt: sql.placeholder("updatedAt"),
		state: "sent",
	})
	.returning()
	.prepare("insert_message");

const selectUnDeliveredMessagesByUserId = db.query.messageTable
	.findMany({
		where: not(eq(messageTable.authorId, sql.placeholder("userId"))),
		with: {
			recipients: {
				columns: { state: true },
				where: and(
					eq(messageRecipientTable.recipientId, sql.placeholder("userId")),
					eq(messageRecipientTable.state, "sent"),
				),
			},
		},
		orderBy: [asc(messageTable.chatId)],
	})
	.prepare("select_un_delivered_messages");

async function selectMessagesToSync(userId: string) {
	return await selectUnDeliveredMessagesByUserId
		.execute({ userId })
		.then((rows) => rows.map(({ recipients, ...message }) => message));
}

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
				state: "pending" as Message["state"],
			})),
		)
		.returning({ recipientIds: messageRecipientTable.recipientId })
		.then((rows) => rows.map((row) => row.recipientIds));
}

const selectMessageRecipientIdsByMessageId = db.query.messageRecipientTable
	.findMany({
		columns: { recipientId: true },
		where: eq(messageRecipientTable.messageId, sql.placeholder("messageId")),
	})
	.prepare("select_message_recipient_ids_by_message_id");

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
	countRecipientsByMessageState,
	// * Message queries
	deleteMessage,
	insertMessage,
	insertMessageRecipients,
	// * Message schemas
	insertMessageSchema,
	pruneMessages,
	selectMessageRecipientIdsByMessageId,
	selectMessageSchema,
	// * Message functions
	selectMessagesToSync,
	updateMessageRecipientsStates,
	updateMessageSchema,
	updateMessageStatus,
};
export type { Message };

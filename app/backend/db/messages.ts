import { eq, sql } from "drizzle-orm";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
import db from "#db";
import { messageTable } from "./messages.sql";

const insertMessageSchema = createInsertSchema(messageTable);
const updateMessageSchema = createUpdateSchema(messageTable);
const selectMessageSchema = createSelectSchema(messageTable);
type Message = z.infer<typeof selectMessageSchema>;

const insertMessage = db
	.insert(messageTable)
	.values({
		id: sql.placeholder("id"),
		createdAt: sql.placeholder("createdAt"),
		updatedAt: sql.placeholder("updatedAt"),
		chatId: sql.placeholder("chatId"),
		authorId: sql.placeholder("authorId"),
		state: sql.placeholder("state"),
		body: sql.placeholder("body"),
	})
	.returning()
	.prepare("insert_message");

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

export {
	// * Message schemas
	insertMessageSchema,
	selectMessageSchema,
	updateMessageSchema,
	// * Message queries
	insertMessage,
	deleteMessage,
	// * Message functions
	updateMessageStatus,
};
export type { Message };

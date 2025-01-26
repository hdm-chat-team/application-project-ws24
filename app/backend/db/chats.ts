import {eq, sql} from "drizzle-orm";
import {createInsertSchema, createSelectSchema} from "drizzle-zod";
import type {z} from "zod";
import db from "#db";
import {chatMemberTable, chatTable, type chatTypeEnumType} from "./chats.sql";
import type {DB, Transaction} from "./types";

const insertChatSchema = createInsertSchema(chatTable);
const selectChatSchema = createSelectSchema(chatTable);
type Chat = z.infer<typeof selectChatSchema>;

const selectChatIdsByUserId = db.query.chatMemberTable
	.findMany({
		columns: { chatId: true },
		where: eq(chatMemberTable.userId, sql.placeholder("id")),
	})
	.prepare("select_chat_ids_by_user_id");

async function insertSelfChat(name: string, trx: Transaction | DB = db) {
	return await trx
		.insert(chatTable)
		.values({
			name,
			chatType: 'self'
		})
		.onConflictDoNothing()
		.returning({ id: chatTable.id })
		.then((rows) => rows[0].id);
}

async function insertSelfChatMembership(
	chatId: string,
	userId: string,
	trx: Transaction | DB = db,
) {
	await trx
		.insert(chatMemberTable)
		.values({
			chatId,
			userId,
		})
		.onConflictDoNothing();
}

async function selectChatWithMembersByUserId(
	chatId: string,
	trx: Transaction | DB = db,
) {
	return await trx.query.chatTable.findFirst({
		columns: { id: true },
		where: (chatTable, { eq }) => eq(chatTable.id, chatId),
		with: { members: { columns: { userId: true } } },
	});
}
async function insertChatWithMembers(userIds: string[]) {
	if (userIds.length < 2) {
		throw new Error("A chat must have at least two members.");
	}
	let chatType: chatTypeEnumType = 'contact';
	if (userIds.length > 2) {
		chatType = 'group'
	}
	return db.transaction(async (tx) => {
		const chatName = userIds.sort().join("-");
		let chatId: string = '';

		const existingChat = await tx.query.chatTable.findFirst({
			where: eq(chatTable.name, chatName),
		});

		if (existingChat) {
			throw new Error("Chat already exists");
		}
		else {
			const result = await tx
				.insert(chatTable)
				.values({
					name: chatName,
					chatType: chatType
				}).returning();
			chatId = result[0].id;
		}
		const mappedUsers = userIds.map((id) => {
			return {
				chatId: chatId,
				userId: id,
			};
		});
		await tx.insert(chatMemberTable).values(mappedUsers);
		return chatId;
	});
}

export {
	// * Chat schemas
	insertChatSchema,
	// * Chat queries
	insertSelfChat,
	insertSelfChatMembership,
	selectChatIdsByUserId,
	selectChatSchema,
	// * Chat functions
	insertChatWithMembers,
	selectChatWithMembersByUserId,
};
export type { Chat };

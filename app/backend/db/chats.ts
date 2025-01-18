import {eq, sql} from "drizzle-orm";
import {createInsertSchema, createSelectSchema} from "drizzle-zod";
import type {z} from "zod";
import db from "#db";
import {chatMemberTable, chatTable} from "./chats.sql";
import type {User} from "./users";

const insertChatSchema = createInsertSchema(chatTable);
const selectChatSchema = createSelectSchema(chatTable);
type Chat = z.infer<typeof selectChatSchema>;

const selectChatIdsByUserId = db.query.chatMemberTable
	.findMany({
		columns: { chatId: true },
		where: eq(chatMemberTable.userId, sql.placeholder("id")),
	})
	.prepare("select_chat_ids_by_user_id");

function insertSelfChat(user: User) {
	return db.transaction(async (tx) => {
		const existingChat = await tx.query.chatTable.findFirst({
			where: eq(chatTable.name, user.username),
		});

		if (!existingChat) {
			const newChat = await tx
				.insert(chatTable)
				.values({
					name: user.username,
				})
				.returning();
			await tx.insert(chatMemberTable).values({
				chatId: newChat[0].id,
				userId: user.id,
			});
		}
	});
}

async function insertChatWithMembers(userIds: string[]) {
	if (userIds.length < 2) {
		throw new Error ( "A chat must have at least two members." );
	}
	return db.transaction(async (tx) => {
		const chatName = userIds.sort().join("-");
		let newChat: { id: string }[] = [];

		const existingChat = await tx.query.chatTable.findFirst({
			where: eq(chatTable.name, chatName),
		});

		if (existingChat) {
			throw new Error ( "Chat already exists" );
		} else {
			const mappedUsers = userIds.map((id) =>{
				return {
					chatId: newChat[0].id,
					userId: id,
				}
			})
				//{chatId: newChat[0].id, userId: userA.id},
			await tx.insert(chatMemberTable).values(mappedUsers);
		}
		return newChat[0];
	});
}

export {
	// * Chat schemas
	insertChatSchema,
	selectChatSchema,
	// * Chat queries
	selectChatIdsByUserId,
	// * Chat functions
	insertSelfChat,
	insertChatWithMembers,
};
export type { Chat };

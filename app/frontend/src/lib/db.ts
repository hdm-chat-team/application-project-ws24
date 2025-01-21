import type { Chat } from "@server/db/chats";
import type { Message } from "@server/db/messages";
import type { Attachment } from "@server/db/attachments"; 
import Dexie from "dexie";
import type { EntityTable } from "dexie";

export type LocalDatabase = Dexie & {
	messages: EntityTable<Message, "id">;
	chats: EntityTable<Chat, "id">;
	attachments: EntityTable<Attachment>;
};

const db = new Dexie("database") as LocalDatabase;

db.version(10).stores({
	messages: "id, body, state, chatId, authorId, createdAt, updatedAt",
	chats: "id, name, createdAt, updatedAt",
	attachments: "id, messageId, url, type",
});

export default db;
export { db };

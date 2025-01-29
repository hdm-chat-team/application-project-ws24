import type { Attachment } from "@server/db/attachments";
import type { Chat } from "@server/db/chats";
import type { Message } from "@server/db/messages";
import Dexie from "dexie";
import type { EntityTable } from "dexie";

export type LocalDatabase = Dexie & {
	messages: EntityTable<Message, "id">;
	chats: EntityTable<Chat, "id">;
	attachments: EntityTable<Attachment & { blob?: Blob }, "url">;
};

const db = new Dexie("database") as LocalDatabase;

db.version(13).stores({
	messages:
		"id, body, state, chatId, authorId, createdAt, updatedAt, receivedAt",
	chats: "id, name, createdAt, updatedAt",
	attachments: "url, messageId, type",
});

export default db;
export { db };

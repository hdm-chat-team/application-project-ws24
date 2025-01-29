import type { Attachment } from "@server/db/attachments";
import type { Chat } from "@server/db/chats";
import type { UserContact } from "@server/db/contact.ts";
import type { Message } from "@server/db/messages";
import type { EntityTable } from "dexie";
import Dexie from "dexie";

export type LocalDatabase = Dexie & {
	messages: EntityTable<Message, "id">;
	chats: EntityTable<Chat, "id">;
	contacts: EntityTable<UserContact, "id">;
	attachments: EntityTable<Attachment & { blob?: Blob }, "url">;
};

const db = new Dexie("database") as LocalDatabase;

db.version(13).stores({
	messages: "id, body, state, chatId, authorId, createdAt, updatedAt",
	chats: "id, name, createdAt, updatedAt",
	contacts: "id, contactId, avatarUrl, displayName",
	attachments: "url, messageId, type",
});

export default db;
export { db };

import type { LocalMessage } from "@/features/message/utils";
import type { Attachment } from "@server/db/attachments";
import type { Chat } from "@server/db/chats";
import type { Contact } from "@server/db/contacts";
import type { Message } from "@server/db/messages";
import type { EntityTable } from "dexie";
import Dexie from "dexie";

export type LocalDatabase = Dexie & {
	messages: EntityTable<LocalMessage, "id">;
	chats: EntityTable<Chat, "id">;
	contacts: EntityTable<UserContact, "id">;
	attachments: EntityTable<Attachment & { blob?: Blob }, "url">;
};

const db = new Dexie("database") as LocalDatabase;

db.version(14).stores({
	messages:
		"id, body, state, chatId, authorId, createdAt, updatedAt, receivedAt",
	chats: "id, name, createdAt, updatedAt",
	contacts: "id, contactId, avatarUrl, displayName",
	attachments: "url, messageId, type",
});

export default db;
export { db };

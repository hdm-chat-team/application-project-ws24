import type { LocalChat } from "@/features/chat/utils";
import type { LocalUser } from "@/features/contacts/types";
import type { LocalMessage } from "@/features/message/utils";
import type { Attachment } from "@server/db/attachments";
import Dexie from "dexie";

export type LocalDatabase = Dexie & {
	users: Dexie.Table<LocalUser, string>;
	chats: Dexie.Table<LocalChat, string>;
	messages: Dexie.Table<LocalMessage, string>;
	messageAttachments: Dexie.Table<Attachment & { blob?: Blob }, string>;
};

const db = new Dexie("database") as LocalDatabase;

db.version(18).stores({
	users: "id, &username, &email, relation, profile.displayName",
	chats: "id, name, type, syncState, createdAt, updatedAt",
	messages: "id, state, chatId, authorId, createdAt, updatedAt, receivedAt",
	messageAttachments: "url, messageId, type",
});

export default db;
export { db };

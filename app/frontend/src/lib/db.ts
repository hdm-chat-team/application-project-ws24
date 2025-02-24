import type { LocalChat } from "@/features/chat/utils";
import type { LocalUser } from "@/features/contacts/types";
import type { LocalMessage } from "@/features/message/utils";
import type { LocalFile } from "@/features/uploadthing/types";
import Dexie from "dexie";

export type LocalDatabase = Dexie & {
	users: Dexie.Table<LocalUser, string>;
	chats: Dexie.Table<LocalChat, string>;
	messages: Dexie.Table<LocalMessage, string>;
	files: Dexie.Table<LocalFile & { blob?: Blob }, string>;
};

const db = new Dexie("database") as LocalDatabase;

db.version(18).stores({
	users: "id, &username, &email, relation, profile.displayName",
	chats: "id, name, type, syncState, createdAt, updatedAt",
	messages: "id, state, chatId, authorId, createdAt, updatedAt, receivedAt",
	files: "customId, originalName, type, createdAt",
});

export default db;
export { db };

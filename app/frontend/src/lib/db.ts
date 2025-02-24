import type { LocalMessage } from "@/features/message/utils";
import type { LocalFile } from "@/features/uploadthing/types";
import type { Chat } from "@server/db/chats";
import Dexie from "dexie";
import type { EntityTable } from "dexie";

export type LocalDatabase = Dexie & {
	messages: EntityTable<LocalMessage, "id">;
	chats: EntityTable<Chat, "id">;
	files: EntityTable<LocalFile & { blob?: Blob }, "customId">;
};

const db = new Dexie("database") as LocalDatabase;

db.version(14).stores({
	messages:
		"id, body, state, chatId, authorId, createdAt, updatedAt, receivedAt",
	chats: "id, name, createdAt, updatedAt",
	files: "customId, originalName, type, createdAt",
});

export default db;
export { db };

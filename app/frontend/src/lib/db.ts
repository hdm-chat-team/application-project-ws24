import type { Chat } from "@server/db/chats";
import type { Message } from "@server/db/messages";
import Dexie from "dexie";
import type { EntityTable } from "dexie";

type LocalDatabase = Dexie & {
	messages: EntityTable<Message, "id">;
	chats: EntityTable<Chat, "id">;
};

const db = new Dexie("database") as LocalDatabase;

db.version(9).stores({
	messages: "id, body, state, chatId, authorId, createdAt, updatedAt",
	chats: "id, name, createdAt, updatedAt",
});

export default db;
export { db };

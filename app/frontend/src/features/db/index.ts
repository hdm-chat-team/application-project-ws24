import type { Chat } from "@server/db/chats";
import type { Message } from "@shared/message";
import Dexie from "dexie";
import type { EntityTable } from "dexie";

const db = new Dexie("database") as Dexie & {
	messages: EntityTable<Message, "id">;
	chats: EntityTable<Chat, "id">;
};

db.version(8).stores({
	messages: "id, body, chatId, authorId, createdAt",
	chats: "id, name, createdAt, updatedAt",
});

export { db };

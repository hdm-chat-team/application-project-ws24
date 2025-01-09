import type { Chat } from "@server/db/chats";
import type { Message } from "@server/db/messages";
import Dexie from "dexie";
import type { EntityTable } from "dexie";

const db = new Dexie("database") as Dexie & {
	messages: EntityTable<Message, "id">;
	chats: EntityTable<Chat, "id">;
};

db.version(9).stores({
	messages: "id, body, state, chatId, authorId, createdAt, updatedAt",
	chats: "id, name, createdAt, updatedAt",
});

export { db };

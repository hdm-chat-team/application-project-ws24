import type { Message } from "@shared/message";
import Dexie from "dexie";
import type { EntityTable } from "dexie";

const db = new Dexie("database") as Dexie & {
	messages: EntityTable<Message, "id">;
};

db.version(6).stores({
	messages: "++id, body, authorId, createdAt",
});

export { db };

import Dexie from "dexie";
import type { EntityTable } from "dexie";

export interface Message {
	id?: string;
	content: string;
	timestamp: number;
	userId: string;
}

const messageDb = new Dexie("MessageDatabase") as Dexie & {
	messages: EntityTable<Message, "id">;
};

messageDb.version(5).stores({
	messages: "++id, content, timestamp, userId",
});

export { messageDb };

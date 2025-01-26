import type {Chat} from "@server/db/chats";
import type {Message} from "@server/db/messages";
import type {EntityTable} from "dexie";
import Dexie from "dexie";
import type {Contacts} from "@server/db/contact.ts";

export type LocalDatabase = Dexie & {
	messages: EntityTable<Message, "id">;
	chats: EntityTable<Chat, "id">;
	contacts: EntityTable<Contacts, "id">;
};

const db = new Dexie("database") as LocalDatabase;

db.version(9).stores({
	messages: "id, body, state, chatId, authorId, createdAt, updatedAt",
	chats: "id, name, createdAt, updatedAt",
	contacts: "id, contactId, avatUrl, displayName",
});

export default db;
export { db };

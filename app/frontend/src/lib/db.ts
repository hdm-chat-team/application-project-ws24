import type { LocalMessage } from "@/features/message/utils";
import type { Attachment } from "@server/db/attachments";
import type { Chat, ChatMembership } from "@server/db/chats";
import type { User, UserContact, UserProfile } from "@server/db/users";
import type { Table } from "dexie";
import Dexie from "dexie";

export type LocalDatabase = Dexie & {
	users: Table<User, string>;
	userContacts: Table<UserContact>;
	userProfiles: Table<UserProfile, string>;
	chats: Table<Chat, string>;
	chatMemberships: Table<ChatMembership>;
	messages: Table<LocalMessage, string>;
	messageAttachments: Table<Attachment & { blob?: Blob }, string>;
};

const db = new Dexie("database") as LocalDatabase;

db.version(16).stores({
	users: "id, username, email",
	userContacts: "[contactorId+contactId], userId, contactId",
	userProfiles: "id, userId, displayName",
	chats: "id, name, type, createdAt, updatedAt",
	chatMemberships: "[chatId+userId], chatId, userId",
	messages:
		"id, body, state, chatId, authorId, createdAt, updatedAt, receivedAt",
	messageAttachments: "url, messageId, type",
});

export default db;
export { db };

import type { LocalMessage } from "@/features/message/utils";
import type { Attachment } from "@server/db/attachments";
import type { Chat, ChatMembership } from "@server/db/chats";
import type { User, UserContact, UserProfile } from "@server/db/users";
import type { EntityTable } from "dexie";
import Dexie from "dexie";

export type LocalDatabase = Dexie & {
	users: EntityTable<User, "id">;
	userContacts: EntityTable<UserContact, "contactorId", "contactId">;
	userProfiles: EntityTable<UserProfile, "id">;
	chats: EntityTable<Chat, "id">;
	chatMemberships: EntityTable<ChatMembership, "chatId", "userId">;
	messages: EntityTable<LocalMessage, "id">;
	messageAttachments: EntityTable<Attachment & { blob?: Blob }, "url">;
};

const db = new Dexie("database") as LocalDatabase;

db.version(16).stores({
	users: "id, username, email",
	userContacts: "[userId+contactId], userId, contactId",
	userProfiles: "id, userId, displayName",
	chats: "id, name, type, createdAt, updatedAt",
	chatMemberships: "[chatId+userId], chatId, userId",
	messages:
		"id, body, state, chatId, authorId, createdAt, updatedAt, receivedAt",
	messageAttachments: "url, messageId, type",
});

export default db;
export { db };

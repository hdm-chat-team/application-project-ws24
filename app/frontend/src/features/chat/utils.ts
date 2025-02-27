import { createId } from "@application-project-ws24/cuid";
import type { Chat } from "@server/db/chats";
import type { User } from "@server/db/users";

type SyncState = "pending" | "synced" | "error";

export type LocalChat = Chat & {
	syncState: SyncState;
	members: Array<User["id"]>;
};

export const createChat = (
	options: Pick<LocalChat, "name" | "type" | "members" | "avatarUrl">,
): LocalChat => ({
	id: createId(),
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	syncState: "pending",
	...options,
});

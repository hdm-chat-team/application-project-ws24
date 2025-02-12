import { createId } from "@application-project-ws24/cuid";
import type { Message } from "@server/db/messages";

// * extends server message with receivedAt
export interface LocalMessage extends Message {
	receivedAt?: string;
}

export function createMessage(
	chatId: string,
	authorId: string,
	body: string,
): LocalMessage {
	return {
		id: createId(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		state: "pending",
		body,
		authorId,
		chatId,
	};
}

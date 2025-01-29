import { createId } from "@application-project-ws24/cuid";
import { Temporal } from "@js-temporal/polyfill";
import type { Message } from "@server/db/messages";

// * extends server message with receivedAt
export interface LocalMessage extends Message {
	receivedAt: string;
}

export function createMessage(
	chatId: string,
	authorId: string,
	body: string,
): Message {
	return {
		id: createId(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		state: "pending",
		body,
		authorId,
		chatId,
		receivedAt: Temporal.Now.zonedDateTimeISO("Europe/Berlin").toString(),
	} as LocalMessage;
}

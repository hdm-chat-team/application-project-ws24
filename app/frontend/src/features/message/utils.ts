import { createId } from "@application-project-ws24/cuid";
import { Temporal } from "@js-temporal/polyfill";
import type { Message } from "@server/db/messages";
import { z } from "zod";

export const messageFormSchema = z.object({
	body: z.string().trim().nonempty(),
});

// * extends server message with receivedAt
export type LocalMessage = Message & {
	receivedAt: string;
	attachmentId?: string;
};

export function localeTime() {
	return Temporal.Now.zonedDateTimeISO("Europe/Berlin").toLocaleString(
		"de-DE",
		{
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		},
	);
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
		body: body || null,
		authorId,
		chatId,
	};
}

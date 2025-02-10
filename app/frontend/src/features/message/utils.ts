import { createId } from "@application-project-ws24/cuid";
import { Temporal } from "@js-temporal/polyfill";
import type { Message } from "@server/db/messages";

// * extends server message with receivedAt
export type LocalMessage = Message & {
	receivedAt: string;
};

export function formatBerlinTime(isoString: string) {
	const berlinTime =
		Temporal.Instant.from(isoString).toZonedDateTimeISO("Europe/Berlin");

	return berlinTime.toLocaleString("de-DE", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
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
	};
}

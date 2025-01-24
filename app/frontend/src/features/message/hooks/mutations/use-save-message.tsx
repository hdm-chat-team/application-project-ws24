import { db } from "@/lib/db";
import type { Attachment } from "@server/db/attachments";
import type { Message } from "@server/db/messages";
import { useMutation } from "@tanstack/react-query";

export function useSaveMessage() {
	return useMutation({
		mutationKey: ["db/save-message"],
		mutationFn: async ({
			message,
			attachments,
		}: {
			message: Message;
			attachments?: Attachment[];
		}) => {
			await db.messages.add(message);

			if (attachments) await db.attachments.bulkPut(attachments);
		},
	});
}

export function useSaveMessageBatch() {
	return useMutation({
		mutationKey: ["db/save-message-batch"],
		mutationFn: async (messages: Message[]) => {
			if (messages.length === 0) return;
			const keys = messages.map((message) => message.id);

			await db.messages.bulkAdd(messages, keys);
		},
	});
}

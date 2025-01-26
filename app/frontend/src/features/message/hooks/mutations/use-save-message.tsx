import { db } from "@/lib/db";
import type { Message } from "@server/db/messages";
import { useMutation } from "@tanstack/react-query";

export function useSaveMessage() {
	return useMutation({
		mutationKey: ["db/save-message"],
		mutationFn: async (message: Message) => {
			await db.messages.put(message);
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

import { messagesByChatIdQueryOptions } from "@/features/message/queries";
import { db } from "@/lib/db";
import type { Message } from "@server/db/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSaveMessage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["db/save-message"],
		mutationFn: async (message: Message) => {
			await db.messages.add(message);

			queryClient.invalidateQueries(
				messagesByChatIdQueryOptions(message.chatId),
			);
		},
	});
}

export function useSaveMessageBatch() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["db/save-message-batch"],
		mutationFn: async (messages: Message[]) => {
			if (messages.length === 0) return;
			const keys = messages.map((message) => message.id);

			await db.messages.bulkAdd(messages, keys);

			queryClient.invalidateQueries({
				queryKey: ["db/messages-by-chat"],
			});
		},
	});
}

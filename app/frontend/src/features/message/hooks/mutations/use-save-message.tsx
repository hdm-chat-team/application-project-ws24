import { messagesByChatIdQueryOptions } from "@/features/message/queries";
import { db } from "@/lib/db";
import type { Message } from "@server/db/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSaveMessage(chatId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["db/save-message", chatId],
		mutationFn: async (message: Message) => {
			await db.messages.add(message);
		},
		onSuccess: () =>
			queryClient.invalidateQueries(messagesByChatIdQueryOptions(chatId)),
	});
}

export function useSaveMessageBatch(chatId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["db/save-message-batch", chatId],
		mutationFn: async (messages: Message[]) => {
			await db.messages.bulkAdd(messages);
		},
		onSuccess: () =>
			queryClient.invalidateQueries(messagesByChatIdQueryOptions(chatId)),
	});
}

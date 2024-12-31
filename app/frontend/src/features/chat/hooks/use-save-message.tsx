import { messagesByChatIdQueryOptions } from "@/features/chat/queries";
import { db } from "@/features/db";
import type { Message } from "@shared/message";
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

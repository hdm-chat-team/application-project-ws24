import { messagesByChatIdQueryOptions } from "@/features/chat/queries";
import { db } from "@/lib/db";
import type { Message } from "@server/db/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateMessage(chatId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["db/update-message", chatId],
		mutationFn: async ({
			messageId,
			state,
		}: { messageId: string; state: Message["state"] }) => {
			console.log(`updating message ${messageId} to state ${state}`);
			await db.messages.update(messageId, { state });
		},
		onSuccess: () =>
			queryClient.invalidateQueries(messagesByChatIdQueryOptions(chatId)),
	});
}

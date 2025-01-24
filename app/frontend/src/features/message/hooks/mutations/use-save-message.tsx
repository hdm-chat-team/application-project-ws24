import { messagesByChatIdQueryOptions } from "@/features/message/queries";
import { db } from "@/lib/db";
import type { Attachment } from "@server/db/attachments";
import type { Message } from "@server/db/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSaveMessage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["db/save-message"],
		mutationFn: async ({
			message,
			attachment,
		}: {
			message: Message;
			attachment?: Attachment;
		}) => {
			await db.messages.add(message);

			if (attachment) {
				await db.attachments.add(attachment);
			}

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

import { messagesByChatIdQueryOptions } from "@/features/message/queries";
import { db } from "@/lib/db";
import type { Message } from "@server/db/messages";
import type { Attachment } from "@server/db/attachments";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSaveAttachment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["db/save-attachment"],
		mutationFn: async ({
			message,
			attachment,
		}: { message: Message; attachment: Attachment }) => {
			await db.messages.add(message);
			await db.attachments.add(attachment);

			queryClient.invalidateQueries(
				messagesByChatIdQueryOptions(message.chatId),
			);
		},
	});
}
import { useUser } from "@/features/auth/hooks";
import { messagesByChatIdQueryOptions } from "@/features/message/queries";
import { useUploadThing } from "@/features/uploadthing/hooks";
import { db } from "@/lib/db";
import { createId } from "@application-project-ws24/cuid";
import type { Attachment } from "@server/db/attachments";
import type { Message } from "@server/db/messages";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

export function useSaveAttachmentMessage(chatId: string) {
	const { user } = useUser();
	const { startUpload } = useUploadThing("attachment");
	const queryClient = useQueryClient();

	return useMutation<void, Error, { file: File; body: string }>({
		mutationKey: ["db/save-attachment-message", chatId],
		mutationFn: async ({ file, body }) => {
			if (!user) return;

			try {
				const messageId = createId();
				const now = new Date().toISOString();

				const message: Message = {
					id: messageId,
					chatId,
					authorId: user.id,
					body: body,
					state: "pending",
					createdAt: now,
					updatedAt: now,
				};

				const result = await startUpload([file], { chatId });
				if (!result?.[0]) throw new Error("Upload failed");

				const attachment: Attachment = {
					url: result[0].url,
					messageId,
					type: file.type.startsWith("image/")
						? "image"
						: file.type.startsWith("video/")
							? "video"
							: "document",
				};

				await db.messages.add(message);
				await db.attachments.add(attachment);

				queryClient.invalidateQueries(messagesByChatIdQueryOptions(chatId));
			} catch (error) {
				console.error("Save attachment error:", error);
				throw error;
			}
		},
	});
}

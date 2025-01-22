import { useUser } from "@/features/auth/hooks";
import { messagesByChatIdQueryOptions } from "@/features/message/queries";
import { useUploadThing } from "@/features/uploadthing/hooks";
import { db } from "@/lib/db";
import { createId } from "@application-project-ws24/cuid";
import type { Attachment } from "@server/db/attachments";
import type { Message } from "@server/db/messages";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSaveAttachmentMessage(chatId: string) {
	const { user } = useUser();
	const { startUpload } = useUploadThing("attachment");
	const queryClient = useQueryClient();

	return useMutation<void, Error, { file: File; body: string }>({
		mutationKey: ["db/save-attachment-message", chatId],
		mutationFn: async ({ file, body }) => {
			if (!user) return;

			const maxSize = file.type.startsWith("image/")
				? 4 * 1024 * 1024
				: file.type.startsWith("video/")
					? 16 * 1024 * 1024
					: 4 * 1024 * 1024;
			if (file.size > maxSize) {
				toast.error(
					"File size too big / max 4MB for images and documents / max 16MB for videos",
				);
			}

			try {
				const messageId = createId();

				// * Remove T and Z from the timestamp so its the same format as the messages so they can be sorted

				const now = new Date().toISOString().replace("T", " ").replace("Z", "");

				const message: Message = {
					id: messageId,
					chatId,
					authorId: user.id,
					body: body,
					state: "pending",
					createdAt: now,
					updatedAt: now,
				};

				const [uploadResult] = await Promise.all([
					startUpload([file], { chatId }).then((res) => {
						if (!res?.[0]) throw new Error("Upload failed");
						return res[0];
					}),
					db.messages.add(message),
				]);

				const attachment: Attachment = {
					url: uploadResult.url,
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

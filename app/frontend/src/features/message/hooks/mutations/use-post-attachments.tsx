import { useUser } from "@/features/auth/hooks";
import { useUploadThing } from "@/features/uploadthing/hooks";
import { createId } from "@application-project-ws24/cuid";
import type { Attachment } from "@server/db/attachments";
import type { Message } from "@server/db/messages";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePostAttachment(chatId: string) {
	const { user } = useUser();
	const { startUpload } = useUploadThing("attachment");

	return useMutation({
		mutationKey: ["api/post-attachment", chatId],
		mutationFn: async ({ file, body }: { file: File; body: string }) => {
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
				return;
			}

			const message = createAttachmentMessage(chatId, user.id, body);
			const result = await startUpload([file]);
			if (!result?.[0]) throw new Error("Upload failed");

			return {
				message,
				attachment: createAttachment(result[0].url, message.id, file.type),
			};
		},
	});
}

function createAttachmentMessage(
	chatId: string,
	authorId: string,
	body: string,
): Message {
	const now = new Date().toISOString().replace("T", " ").replace("Z", "");
	return {
		id: createId(),
		chatId,
		authorId,
		body,
		state: "pending",
		createdAt: now,
		updatedAt: now,
	};
}

function createAttachment(
	url: string,
	messageId: string,
	fileType: string,
): Attachment {
	return {
		url,
		messageId,
		type: fileType.startsWith("image/")
			? "image"
			: fileType.startsWith("video/")
				? "video"
				: "document",
	};
}

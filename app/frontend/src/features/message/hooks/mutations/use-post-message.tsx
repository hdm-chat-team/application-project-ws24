import { useUploadThing } from "@/features/uploadthing/hooks";
import api from "@/lib/api";
import db from "@/lib/db";
import type { Attachment } from "@server/db/attachments";
import type { Message } from "@server/db/messages";
import { useMutation } from "@tanstack/react-query";

export function usePostMessage(chatId: string) {
	const { startUpload } = useUploadThing(
		(routeRegistry) => routeRegistry.attachment,
	);
	return useMutation({
		mutationKey: [api.chat.$url().pathname, chatId],
		mutationFn: async ({
			message,
			files,
		}: { message: Message; files: File[] }) => {
			const result = await api.chat.$post({
				form: message,
			});
			if (!result.ok) {
				throw new Error("Failed to send message");
			}

			const insertedMessageId = (await result.json()).data;
			if (files.length > 0) startUpload(files, { id: insertedMessageId });
		},
		onMutate: async ({ message }: { message: Message; files: File[] }) => {
			await db.messages.add({ ...message, state: "sent" });
		},
		onError: async (_error, { message }) => {
			await db.messages.delete(message.id);
		},
	});
}

export function useSaveAttachment() {
	return useMutation({
		mutationKey: ["db", "save", "attachment"],
		mutationFn: async (attachment: Attachment) => {
			await db.attachments.add(attachment);
		},
	});
}

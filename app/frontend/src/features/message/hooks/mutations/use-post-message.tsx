import { useUploadThing } from "@/features/uploadthing/hooks";
import { api } from "@/lib/api";
import { compressToAvif } from "@/lib/compression";
import { db } from "@/lib/db";
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
			const result = await api.chat.$post({ form: message });
			if (!result.ok) throw new Error("Failed to send message");

			const messageId = (await result.json()).data;

			if (files.length === 0) return;

			const processedFiles = await Promise.all(
				files.map(async (file) => {
					if (!file.type.startsWith("image/")) return file;
					const compressed = await compressToAvif(file);
					return compressed.size < file.size ? compressed : file;
				}),
			);

			await startUpload(processedFiles, { id: messageId });
		},
		onMutate: ({ message }) => db.messages.add({ ...message, state: "sent" }),
		onError: (_error, { message }) => db.messages.delete(message.id),
	});
}

export function useSaveAttachment() {
	return useMutation({
		mutationKey: ["db", "save", "attachment"],
		mutationFn: async (attachment: Attachment) => {
			await db.attachments.add(attachment);
		},
		onMutate: async ({ url }) => {
			const blob = await fetch(url)
				.then((res) => res.blob())
				.catch((err) => {
					console.error("Failed to fetch attachment", err);
				});

			if (!blob) return;

			return blob;
		},
		onSuccess: (_, { url }, blob) => db.attachments.update(url, { blob }),
	});
}

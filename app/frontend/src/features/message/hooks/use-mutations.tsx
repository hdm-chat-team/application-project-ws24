import type { LocalMessage } from "@/features/message/utils";
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
		}: { message: LocalMessage; files: File[] }) => {
			// * send message
			const formData = {
				...message,
				hasFile: String(files.length > 0),
			};

			const result = await api.chat.$post({ form: formData });

			if (!result.ok) throw new Error("Failed to send message");

			const messageId = (await result.json()).data;

			// * compress and upload attachments
			if (files.length === 0) return;
			const processedFiles = await Promise.all(
				files.map(async (file) => {
					if (!file.type.startsWith("image/")) return file;
					const compressedFile = await compressToAvif(file);
					return compressedFile.size < file.size ? compressedFile : file;
				}),
			);
			await startUpload(processedFiles, { id: messageId });
		},
		onMutate: ({ message }) => db.messages.add({ ...message, state: "sent" }),
		onError: (_error, { message }) => db.messages.delete(message.id), // ? still persist and add retry feature?
	});
}

export function useSaveMessage() {
	return useMutation({
		mutationKey: ["db/save-message"],
		mutationFn: async (message: LocalMessage) => {
			await db.messages.put(message);
		},
	});
}

export function useSaveMessageBatch() {
	return useMutation({
		mutationKey: ["db/save-message-batch"],
		mutationFn: async (messages: LocalMessage[]) => {
			if (messages.length === 0) return;
			const keys = messages.map((message) => message.id);
			await db.messages.bulkAdd(messages, keys);
		},
	});
}

export function useUpdateMessage() {
	return useMutation({
		mutationKey: ["db/update-message"],
		mutationFn: async ({
			messageId,
			state,
		}: { messageId: Message["id"]; state: Message["state"] }) => {
			await db.messages.update(messageId, { state });
		},
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

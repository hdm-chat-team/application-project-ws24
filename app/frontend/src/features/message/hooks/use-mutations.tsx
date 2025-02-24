import type { LocalMessage } from "@/features/message/utils";
import { useUploadThing } from "@/features/uploadthing/hooks";
import { api } from "@/lib/api";
import { compressToAvif } from "@/lib/compression";
import { db } from "@/lib/db";
import type { Message } from "@server/db/messages";
import { useMutation } from "@tanstack/react-query";
import { saveFile } from "@/features/uploadthing/mutations";

export function usePostMessage(chatId: string) {
	const { startUpload } = useUploadThing(
		(routeRegistry) => routeRegistry.attachment,
	);

	return useMutation({
		mutationKey: [api.chat.$url().pathname, chatId],
		mutationFn: async ({
			message,
			files,
		}: {
			message: LocalMessage;
			files: File[];
		}) => {
			const formData = {
				...message,
				body: message.body ?? "",
			};

			const result = await api.chat.$post({ form: formData });

			if (!result.ok) throw new Error("Failed to send message");

			const messageId = (await result.json()).data;

			// * compress and upload attachments
			if (files.length === 0) return { message, messageId };
			const processedFiles = await Promise.all(
				files.map(async (file) => {
					if (!file.type.startsWith("image/")) return file;
					const compressedFile = await compressToAvif(file);
					return compressedFile.size < file.size ? compressedFile : file;
				}),
			);

			// * upload and save attachment
			const [uploadResult] =
				(await startUpload(processedFiles, { id: messageId })) ?? [];
			if (!uploadResult?.customId) throw new Error("Upload failed");

			await Promise.all([
				saveFile(processedFiles[0], uploadResult.customId),
				db.messages
					.where("id")
					.equals(messageId)
					.modify((msg) => {
						msg.attachmentId = uploadResult.customId ?? undefined;
					}),
			]);

			return { message, messageId };
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
		}: {
			messageId: Message["id"];
			state: Message["state"];
		}) => {
			await db.messages.update(messageId, { state });
		},
	});
}

export function useSaveAttachment() {
	return useMutation({
		mutationKey: ["db", "save", "file-from-url"],
		mutationFn: async ({
			messageId,
			type,
		}: { messageId: string; type: string }) => {
			const existingFile = await db.files.get(messageId);
			if (existingFile?.blob) return;

			const response = await fetch(`/api/files/${messageId}`);
			const blob = await response.blob();
			const file = new File([blob], messageId, { type });

			await saveFile(file, messageId);
		},
	});
}

import api from "@/lib/api";
import db from "@/lib/db";
import type { Message } from "@server/db/messages";
import { useMutation } from "@tanstack/react-query";

export function usePostMessage(chatId: string) {
	return useMutation({
		mutationKey: [api.chat.$url().pathname, chatId],
		mutationFn: async (message: Message) => {
			const result = await api.chat.$post({
				form: message,
			});
			if (!result.ok) {
				throw new Error("Failed to send message");
			}
		},
		onMutate: async (message: Message) => {
			await db.messages.add({ ...message, state: "sent" });
		},
		onError: async (_error, message) => {
			await db.messages.delete(message.id);
		},
	});
}

export function usePostAttachment(messageId: string) {
	return useMutation({
		mutationKey: [api.uploadthing.$url().pathname, messageId],
		mutationFn: async (message: Message) => {
			await db.messages.put(message);
		},
	});
}

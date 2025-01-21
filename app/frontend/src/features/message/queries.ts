import { db } from "@/lib/db";
import { queryOptions } from "@tanstack/react-query";

export const messagesByChatIdQueryFn = async (id: string) => {
	const messages = await db.messages
		.where("chatId")
		.equals(id)
		.sortBy("createdAt");

	const messagesWithAttachments = await Promise.all(
		messages.map(async (message) => {
			const attachments = await db.attachments
				.where("messageId")
				.equals(message.id)
				.toArray();

			return {
				...message,
				attachments,
			};
		}),
	);

	return messagesWithAttachments;
};

export const messageStateByIdQueryFn = (id: string) =>
	db.messages
		.where("id")
		.equals(id)
		.first()
		.then((message) => message?.state);

export const messagesByChatIdQueryOptions = (chatId: string) =>
	queryOptions({
		queryKey: ["db/messages-by-chat", chatId],
		initialData: [],
		queryFn: () => messagesByChatIdQueryFn(chatId),
	});

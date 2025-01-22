import { db } from "@/lib/db";
import { queryOptions } from "@tanstack/react-query";

export const messagesByChatIdQueryFn = async (id: string) => {
	const messages = await db.messages
		.where("chatId")
		.equals(id)
		.sortBy("createdAt");

	const attachments = await db.attachments
		.where("messageId")
		.anyOf(messages.map((m) => m.id))
		.toArray();

	// * If there are no attachments, return messages without attachments
	if (attachments.length === 0) {
		return messages.map((message) => ({ ...message, attachments: [] }));
	}

	// * Group attachments by messageId
	const attachmentsByMessageId = Object.groupBy(
		attachments,
		(att) => att.messageId,
	);

	// * Map messages to their attachments
	return messages.map((message) => ({
		...message,
		attachments: attachmentsByMessageId[message.id] || [],
	}));
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

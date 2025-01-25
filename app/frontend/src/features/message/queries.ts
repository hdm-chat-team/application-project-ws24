import { db } from "@/lib/db";

export const messagesByChatIdQueryFn = async (id: string) =>
	db.messages.where("chatId").equals(id).sortBy("createdAt");

export const messageStateByIdQueryFn = (id: string) =>
	db.messages
		.where("id")
		.equals(id)
		.first()
		.then((message) => message?.state);

export const attachmentsByMessageIdQueryFn = (id: string) =>
	db.attachments.where({ messageId: id }).toArray();

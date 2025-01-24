import { db } from "@/lib/db";
import { queryOptions } from "@tanstack/react-query";

export const messagesByChatIdQueryFn = async (id: string) => {
	return db.messages.where("chatId").equals(id).sortBy("createdAt");
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

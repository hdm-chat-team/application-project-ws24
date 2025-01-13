import { db } from "@/lib/db";
import { queryOptions } from "@tanstack/react-query";

export const messagesByChatIdQueryFn = (id: string) =>
	db.messages.where("chatId").equals(id).sortBy("createdAt");

export const messagesByChatIdQueryOptions = (chatId: string) =>
	queryOptions({
		queryKey: ["db/messages-by-chat", chatId],
		initialData: [],
		queryFn: () => messagesByChatIdQueryFn(chatId),
	});

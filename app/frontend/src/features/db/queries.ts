import { db } from "@/features/db";
import { queryOptions } from "@tanstack/react-query";

export const messagesByChatIdQueryOptions = (chatId: string) =>
	queryOptions({
		queryKey: ["db/messages-by-chat", chatId],
		queryFn: async () => {
			return await db.messages.where("chatId").equals(chatId).toArray();
		},
		initialData: [],
	});

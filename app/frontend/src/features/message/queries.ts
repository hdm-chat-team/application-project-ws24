import { db } from "@/lib/db";
import type { Message } from "@server/db/messages";
import { queryOptions } from "@tanstack/react-query";

export const messagesByChatIdQueryOptions = (chatId: string) =>
	queryOptions<Message[]>({
		queryKey: ["db/messages-by-chat", chatId],
		initialData: [],
		queryFn: async () => {
			return await db.messages
				.where("chatId")
				.equals(chatId)
				.sortBy("createdAt");
		},
	});

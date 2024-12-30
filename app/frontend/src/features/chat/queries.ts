import { db } from "@/features/db";
import api from "@/lib/api";
import type { Chat } from "@server/db/chats";
import { queryOptions } from "@tanstack/react-query";

export const userChatsQueryOptions = queryOptions<Chat[]>({
	queryKey: [api.user.chats.$url().pathname],
	queryFn: async () => {
		const response = await api.user.chats.$get();
		if (!response.ok) return [];

		return (await response.json()).data;
	},
});

export const messagesByChatIdQueryOptions = (chatId: string) =>
	queryOptions({
		queryKey: ["db/messages-by-chat", chatId],
		initialData: [],
		queryFn: async () => {
			return await db.messages.where("chatId").equals(chatId).toArray();
		},
	});

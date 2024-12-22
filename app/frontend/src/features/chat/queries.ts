import api from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";

export const userChatsQueryOptions = queryOptions({
	queryKey: [api.profile.chats.$url().pathname],
	queryFn: async () => {
		const response = await api.profile.chats.$get();
		if (!response.ok) return [];
		const chats = (await response.json()).chats.map((chat) => ({
			...chat,
			createdAt: new Date(chat.createdAt),
			updatedAt: chat.updatedAt ? new Date(chat.updatedAt) : null,
		}));
		return chats;
	},
});

import api from "@/lib/api";
import type { Chat } from "@server/db/chats";
import { queryOptions } from "@tanstack/react-query";

export const userChatsQueryOptions = queryOptions<Chat[]>({
	queryKey: [api.user.chats.$url().pathname],
	initialData: [],
	queryFn: async () => {
		const response = await api.user.chats.$get();
		if (!response.ok) return [];

		return (await response.json()).data;
	},
});

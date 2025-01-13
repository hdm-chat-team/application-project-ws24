import api from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";

export const userChatsQueryOptions = queryOptions({
	queryKey: [api.user.chats.$url().pathname],
	queryFn: async () => {
		const response = await api.user.chats.$get();
		if (!response.ok) throw new Error("Failed to fetch chats");

		return (await response.json()).data;
	},
});

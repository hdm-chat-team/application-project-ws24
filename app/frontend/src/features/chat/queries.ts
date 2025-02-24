import api from "@/lib/api";
import db from "@/lib/db";
import { queryOptions } from "@tanstack/react-query";

export const chatsQueryFn = () => db.chats.toArray();
export const chatByIdQueryFn = (chatId: string) => db.chats.get(chatId);
export const selfChatQueryFn = () =>
	db.chats.where("type").equals("self").first();

export const directChatByMemberIdQueryFn = (memberId: string) =>
	db.chats
		.where("type")
		.equals("direct")
		.and((chat) => chat.members?.includes(memberId))
		.first();

export const chatByIdQueryOptions = (chatId: string) =>
	queryOptions({
		queryKey: ["chat", chatId],
		queryFn: () => chatByIdQueryFn(chatId),
	});

export const syncChatsQueryOptions = queryOptions({
	queryKey: ["GET", api.user.chats.$url().pathname],
	queryFn: async () => {
		const response = await api.user.chats.$get();
		if (!response.ok) throw new Error("Failed to fetch chats");

		return (await response.json()).data;
	},
});

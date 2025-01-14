import api from "@/lib/api";
import db from "@/lib/db";
import type { Chat } from "@server/db/chats";
import { queryOptions } from "@tanstack/react-query";

export const chatsQueryFn = () => db.chats.toArray();

export const chatsQueryOptions = queryOptions<Chat[]>({
	queryKey: ["db", "chats"],
	queryFn: chatsQueryFn,
});

export const chatByIdQueryFn = (chatId: string) =>
	db.chats.where("id").equals(chatId).first();

export const chatByIdQueryOptions = (chatId: string) =>
	queryOptions<Chat | undefined>({
		queryKey: ["db", "chats"],
		queryFn: () => chatByIdQueryFn(chatId),
	});

export const syncChatsQueryOptions = queryOptions({
	queryKey: [api.user.chats.$url().pathname],
	queryFn: async () => {
		const response = await api.user.chats.$get();
		if (!response.ok) throw new Error("Failed to fetch chats");

		return (await response.json()).data;
	},
});

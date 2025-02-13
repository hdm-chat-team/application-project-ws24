import api from "@/lib/api";
import db from "@/lib/db";
import { queryOptions } from "@tanstack/react-query";

export const chatsQueryFn = () => db.chats.toArray();
export const chatByIdQueryFn = (chatId: string) => db.chats.get(chatId);
export const selfChatQueryFn = () =>
	db.chats.where("type").equals("self").first();

export const directChatPartnerQueryFn = (chatId: string, userId: string) =>
	db.chatMemberships
		.where("chatId")
		.equals(chatId)
		.filter((member) => member.userId !== userId)
		.first()
		.then((member) =>
			member
				? db.userProfiles.where("userId").equals(member.userId).first()
				: undefined,
		)
		.then((profile) => profile?.displayName);

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

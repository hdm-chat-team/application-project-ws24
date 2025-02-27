import { db } from "@/lib/db";

export const messagesByChatIdQueryFn = async (id: string) =>
	db.messages.where("chatId").equals(id).sortBy("createdAt");

export const messageStateByIdQueryFn = (id: string) =>
	db.messages.get(id).then((message) => message?.state);

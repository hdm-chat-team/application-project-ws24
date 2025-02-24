import api from "@/lib/api";
import db from "@/lib/db";
import { useMutation } from "@tanstack/react-query";
import type { LocalChat } from "../../utils";

export function usePostDirectChat() {
	return useMutation({
		mutationKey: ["POST", api.chat.direct.$url().pathname],
		mutationFn: async (input: LocalChat) => {
			const result = await api.chat.direct.$post({
				json: input,
			});
			if (!result.ok) throw new Error("Failed to create chat");

			return (await result.json()).data;
		},
		onError: (_error, input) =>
			db.chats.update(input.id, { syncState: "error" }),
		onSuccess: (data) => {
			db.chats.put({
				...data.chat,
				members: data.members,
				syncState: "synced",
			});
		},
	});
}

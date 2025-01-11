import { userChatsQueryOptions } from "@/features/chat/queries";
import { db } from "@/lib/db";
import type { Chat } from "@server/db/chats";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSaveChats() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["db/save-chat-batch"],
		mutationFn: async (chats: Chat[]) => {
			if (chats.length === 0) return;

			const keys = chats.map((chat) => chat.id);
			await db.chats.bulkAdd(chats, keys);
			queryClient.invalidateQueries(userChatsQueryOptions);
		},
	});
}

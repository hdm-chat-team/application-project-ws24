import { db } from "@/lib/db";
import type { Chat } from "@server/db/chats";
import { useMutation } from "@tanstack/react-query";

export function useSaveChats() {
	return useMutation({
		mutationKey: ["db/save-chat-batch"],
		mutationFn: async (chats: Chat[]) => {
			await db.chats.bulkPut(chats);
		},
	});
}

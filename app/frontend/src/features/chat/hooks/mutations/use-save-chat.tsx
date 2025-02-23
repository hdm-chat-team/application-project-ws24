import type { LocalChat } from "@/features/chat/utils";
import { db } from "@/lib/db";
import { useMutation } from "@tanstack/react-query";

export function useSaveChat() {
	return useMutation({
		mutationKey: ["db/save-chat-batch"],
		mutationFn: async (chats: LocalChat) => {
			await db.chats.put(chats);
		},
	});
}

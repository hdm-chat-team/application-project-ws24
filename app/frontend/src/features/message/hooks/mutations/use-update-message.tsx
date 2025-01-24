import { db } from "@/lib/db";
import type { Message } from "@server/db/messages";
import { useMutation } from "@tanstack/react-query";

export function useUpdateMessage() {
	return useMutation({
		mutationKey: ["db/update-message"],
		mutationFn: async ({
			messageId,
			state,
		}: { messageId: string; state: Message["state"] }) => {
			await db.messages.update(messageId, { state });
		},
	});
}

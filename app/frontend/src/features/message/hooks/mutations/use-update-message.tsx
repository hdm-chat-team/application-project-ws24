import { db } from "@/lib/db";
import type { Message } from "@server/db/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateMessage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["db/update-message"],
		mutationFn: async ({
			messageId,
			state,
		}: { messageId: string; state: Message["state"] }) => {
			await db.messages.update(messageId, { state });

			queryClient.invalidateQueries({ queryKey: ["db/messages-by-chat"] });
		},
	});
}

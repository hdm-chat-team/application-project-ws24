import { useUser } from "@/features/auth";
import api from "@/lib/api";
import { createId } from "@application-project-ws24/cuid";
import type { Message } from "@server/db/messages";
import { useMutation } from "@tanstack/react-query";

export function usePostMessageMutation(chatId: string) {
	const { user } = useUser();
	return useMutation({
		mutationKey: [api.chat.$url().pathname, chatId],
		mutationFn: async (body: string) => {
			if (!user) return;

			const message = createMessage(chatId, user.id, body);
			const result = await api.chat.$post({
				form: message,
			});
			if (!result.ok) {
				throw new Error("Failed to send message");
			}
		},
	});
}

function createMessage(
	chatId: string,
	authorId: string,
	body: string,
): Message {
	return {
		id: createId(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		state: "pending",
		body,
		authorId,
		chatId,
	};
}

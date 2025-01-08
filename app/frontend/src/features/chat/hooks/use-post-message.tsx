import { useUser } from "@/features/auth";
import api from "@/lib/api";
import { createMessage } from "@shared/message";
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

import { useUser } from "@/features/auth";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function usePostMessageMutation(chatId: string) {
	const user = useUser();
	return useMutation({
		mutationKey: [api.chat[":id"].$url({ param: { id: chatId } }).pathname],
		mutationFn: async (body: string) => {
			if (!user) return;

			const res = await api.chat[":id"].$post({
				param: { id: chatId },
				form: { body },
			});
			if (!res.ok) {
				throw new Error("Failed to send message");
			}
		},
	});
}

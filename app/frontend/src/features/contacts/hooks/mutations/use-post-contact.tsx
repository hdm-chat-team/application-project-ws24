import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function usePostContactMutation() {
	return useMutation({
		mutationKey: ["POST", api.user.contacts.$url().pathname],
		mutationFn: async (contactId: string) => {
			const result = await api.user.contacts.$post({
				json: {
					contactId,
				},
			});
			if (!result.ok) {
				throw new Error("Failed to create contact");
			}
			return result.json();
		},
	});
}

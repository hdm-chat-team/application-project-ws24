import api from "@/lib/api.ts";
import { useMutation } from "@tanstack/react-query";

export function usePostContactMutation() {
	const mutationKey = [api.contact.$url().pathname];
	return useMutation({
		mutationKey: mutationKey,
		mutationFn: async (email: string) => {
			const result = await api.contact.$post({
				form: {
					email,
				},
			});
			if (!result.ok) {
				throw new Error("Failed to create contact");
			}
			return result.json();
		},
	});
}

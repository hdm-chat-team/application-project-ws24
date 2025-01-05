import { authQueryOptions, useUser } from "@/features/auth";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProfileMutation() {
	const queryClient = useQueryClient();
	const { profile } = useUser();
	return useMutation({
		mutationKey: [api.user.profile.$url().pathname],
		mutationFn: async (newName: string) => {
			if (profile.displayName === newName) return;

			const response = await api.user.profile.$put({
				form: {
					displayName: newName,
				},
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message);
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(authQueryOptions);
		},
		onError: (error) => {
			console.error("Error updating profile:", error.message);
		},
	});
}

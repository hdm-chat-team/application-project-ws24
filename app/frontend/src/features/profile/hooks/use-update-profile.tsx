import { authQueryOptions, useUser } from "@/features/auth";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProfileMutation() {
	const queryClient = useQueryClient();
	const { profile } = useUser();
	return useMutation({
		mutationKey: [api.user.profile.$url().pathname],
		mutationFn: async ({
			displayName,
			avatarUrl,
		}: { displayName: string; avatarUrl?: string }) => {
			if (
				profile.displayName === displayName &&
				profile.avatarUrl === avatarUrl
			)
				return;

			const response = await api.user.profile.$put({
				form: {
					displayName,
					avatarUrl,
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

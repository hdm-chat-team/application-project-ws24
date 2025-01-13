import { authQueryOptions } from "@/features/auth/queries";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProfileMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: [api.user.profile.$url().pathname],
		mutationFn: async ({
			displayName,
			avatarUrl,
		}: { displayName: string; avatarUrl?: string }) => {
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

export function useDeleteAvatarMutation() {
	return useMutation({
		mutationKey: [api.user.avatar.$url().pathname],
		mutationFn: async (avatarUrl: string) => {
			const response = await api.user.avatar.$delete({
				json: { avatarUrl },
			});
			if (!response.ok) {
				throw new Error("Failed to delete avatar");
			}
			return response.json();
		},
		onError: (error) => {
			console.error("Error deleting avatar:", error.message);
		},
	});
}

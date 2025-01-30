import { authQueryOptions } from "@/features/auth/queries";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProfileMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: ["PUT", api.user.profile.$url().pathname],
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
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update profile");
			}
			return (await response.json()).data;
		},
		onMutate: async ({ displayName, avatarUrl }) => {
			await queryClient.cancelQueries(authQueryOptions);
			const authQueryDataSnapshot = queryClient.getQueryData(
				authQueryOptions.queryKey,
			);
			queryClient.setQueryData(authQueryOptions.queryKey, (data) => {
				if (!data) return data;
				return {
					...data,
					profile: {
						...data.profile,
						displayName,
						avatarUrl: avatarUrl ?? data.profile.avatarUrl,
					},
				};
			});

			return { authQueryDataSnapshot };
		},
		onSuccess: (returnedProfile) =>
			queryClient.setQueryData(authQueryOptions.queryKey, (data) => {
				if (!data) return data;
				return {
					...data,
					profile: returnedProfile,
				};
			}),
		onError: (_error, _responseData, context) =>
			queryClient.setQueryData(
				authQueryOptions.queryKey,
				context?.authQueryDataSnapshot,
			),
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

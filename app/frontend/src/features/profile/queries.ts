import api from "@/lib/api";
import type { UserProfile } from "@server/db/schema.sql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PROFILE_QUERY_KEY = ["profile"];

// * Hook to fetch profile

export function useProfile() {
	return useQuery<UserProfile>({
		queryKey: PROFILE_QUERY_KEY,
		queryFn: async () => {
			const response = await api.profile.me.$get();
			if (!response.ok) {
				throw new Error("Failed to fetch profile");
			}
			return response.json();
		},
		retry: false,
	});
}

// * Hook to update profile

export function useUpdateProfile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (newName: string) => {
			const profile = queryClient.getQueryData<UserProfile>(PROFILE_QUERY_KEY);
			const response = await api.profile.me.$put({
				form: {
					displayName: newName,
					avatar_url: profile?.avatar_url ?? "", //  not needed rn, not commented out because its needed from the backend
				},
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message);
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
		},
		onError: (error: Error) => {
			console.error("Error updating profile:", error.message);
		},
	});
}

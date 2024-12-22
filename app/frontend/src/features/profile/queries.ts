import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { UserProfile } from "@server/db/schema.sql";
import api from "@/lib/api";

const PROFILE_QUERY_KEY = ["profile"];

export function useProfile() {
	return useQuery<UserProfile>({
		queryKey: PROFILE_QUERY_KEY,
		queryFn: async () => {
			try {
				const response = await api.profile.me.$get();
				if (!response.ok) {
					throw new Error("Profile could not be loaded");
				}
				return response.json();
			} catch (error) {
				throw new Error("Network or server error while loading profile");
			}
		},
		retry: false,
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (newName: string) => {
			const profile = queryClient.getQueryData<UserProfile>(PROFILE_QUERY_KEY);

			const response = await api.profile.me.$put({
				form: {
					displayName: newName,
					avatar_url: profile?.avatar_url ?? "",
				},
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update profile");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
		},
		onError: (error) => {
			console.error("Error updating profile:", error);
		},
	});
}

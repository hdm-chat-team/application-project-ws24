import api from "@/lib/api";
import type { UserProfile } from "@server/db/users";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";

const PROFILE_QUERY_KEY = ["profile"];

// * Query options for own profile

export const profileQueryOptions = queryOptions<UserProfile>({
	queryKey: PROFILE_QUERY_KEY,
	queryFn: async () => {
		const response = await api.user.profile.$get();
		if (!response.ok) {
			throw new Error("Failed to fetch profile");
		}
		return response.json();
	},
});

// * Query options for fetch user profile by userId
// * @param userId - The ID of the user whose profile to fetch

// FIXME: Add username support like api.profile["@:username"].$get() for a better user experience

export const userProfileQueryOptions = (userId: string) =>
	queryOptions<{ data: UserProfile }>({
		queryKey: ["userProfile", userId],
		queryFn: async () => {
			const response = await api.user[":id"].$get({
				param: { id: userId },
			});

			if (!response.ok) {
				throw new Error("Failed to fetch user profile");
			}

			return response.json();
		},
	});

// * Mutation to update profile

export function useUpdateProfile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (newName: string) => {
			const profile = queryClient.getQueryData<UserProfile>(PROFILE_QUERY_KEY);
			const response = await api.user.profile.$put({
				form: {
					displayName: newName,
					avatarUrl: profile?.avatarUrl ?? "",
					htmlUrl: profile?.htmlUrl ?? "",
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

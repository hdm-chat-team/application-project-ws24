import api from "@/lib/api";
import type { User, UserProfile } from "@server/db/users";
import { queryOptions } from "@tanstack/react-query";

export const authQueryOptions = queryOptions<{
	user: User;
	profile: UserProfile;
} | null>({
	queryKey: [api.auth.$url().pathname],
	queryFn: async () => {
		const response = await api.auth.$get();
		if (response.status === 401) return null;
		if (!response.ok) throw new Error("Failed to authenticate");

		return (await response.json()).data;
	},
	staleTime: Number.POSITIVE_INFINITY,
});

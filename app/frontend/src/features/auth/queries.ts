import api from "@/lib/api";
import type { User, UserProfile } from "@server/db/users";
import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

export const authQueryOptions = queryOptions<{
	user: User;
	profile: UserProfile;
}>({
	queryKey: [api.auth.$url().pathname],
	queryFn: async () => {
		const response = await api.auth.$get();
		if (!response.ok)
			throw redirect({ to: "/signin", search: { from: location.href } });

		return (await response.json()).data;
	},
	staleTime: Number.POSITIVE_INFINITY,
});

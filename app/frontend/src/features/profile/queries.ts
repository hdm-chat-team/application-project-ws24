import api from "@/lib/api";
import type { UserProfile } from "@server/db/users";
import { queryOptions } from "@tanstack/react-query";

export const userProfileQueryOptions = (userId: string) =>
	queryOptions<UserProfile>({
		queryKey: [api.user[":id"].$url({ param: { id: userId } }).pathname],
		queryFn: async () => {
			const response = await api.user[":id"].$get({
				param: { id: userId },
			});

			if (!response.ok) {
				throw new Error("Failed to fetch user profile");
			}

			return (await response.json()).data;
		},
	});

import api from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";

export const userProfileQueryOptions = (username: string) =>
	queryOptions({
		queryKey: ["GET", api.user.username[":username"].$url().pathname, username],
		queryFn: async () => {
			const response = await api.user.username[":username"].$get({
				param: { username },
			});

			if (!response.ok) {
				throw new Error("Failed to fetch user profile");
			}

			return (await response.json()).data;
		},
	});

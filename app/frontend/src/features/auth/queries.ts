import api from "@/lib/api";
import type { User } from "@server/db/users";
import { queryOptions } from "@tanstack/react-query";

export const authQueryOptions = queryOptions<User | null>({
	queryKey: [api.auth.$url().pathname],
	queryFn: async () => {
		const response = await api.auth.$get();
		if (!response.ok) return null;
		const data = await response.json();
		return data === null
			? null
			: {
					...data,
					createdAt: new Date(data.createdAt),
					updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
				};
	},
	staleTime: Number.POSITIVE_INFINITY,
});

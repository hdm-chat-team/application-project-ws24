import api from "@/lib/api";
import type { User } from "@server/db/users";
import { queryOptions } from "@tanstack/react-query";

export const authQueryOptions = queryOptions<User | null>({
	queryKey: [api.auth.$url().pathname],
	initialData: null,
	queryFn: async () => {
		const response = await api.auth.$get();
		if (!response.ok) return null;

		return (await response.json()).data;
	},
	staleTime: Number.POSITIVE_INFINITY,
});

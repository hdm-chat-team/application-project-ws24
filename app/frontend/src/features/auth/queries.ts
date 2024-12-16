import api from "@/lib/api";
import type { User } from "@server/db/schema.sql";
import { queryOptions } from "@tanstack/react-query";

export const authQueryOptions = queryOptions<User | null>({
	queryKey: ["auth-user"],
	queryFn: async () => {
		const response = await api.auth.$get();
		if (!response.ok) return null;
		return await response.json();
	},
	staleTime: Number.POSITIVE_INFINITY,
});

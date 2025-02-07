import api from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";

export const authQueryOptions = queryOptions({
	queryKey: ["GET", api.auth.$url().pathname],
	queryFn: async () => {
		const response = await api.auth.$get();
		return (await response.json()).data;
	},
	staleTime: Number.POSITIVE_INFINITY,
});

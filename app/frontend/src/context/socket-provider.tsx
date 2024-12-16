import api from "@/lib/api";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { createContext, type ReactNode } from "react";

export const SocketContext = createContext<
	UseQueryResult<WebSocket, Error> | undefined
>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
	const query = useQuery({
		queryKey: [api.socket.$url().pathname],
		queryFn: async () => api.socket.$ws(),
		staleTime: Number.POSITIVE_INFINITY,
	});

	return (
		<SocketContext.Provider value={query}>{children}</SocketContext.Provider>
	);
}

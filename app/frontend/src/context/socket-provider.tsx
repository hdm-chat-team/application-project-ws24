import api from "@/lib/api";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { type ReactNode, createContext } from "react";

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

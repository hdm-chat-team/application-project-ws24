import api from "@/lib/api";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { type ReactNode, createContext } from "react";

export const ChatSocketContext = createContext<
	UseQueryResult<WebSocket, Error> | undefined
>(undefined);

export function ChatSocketProvider({ children }: { children: ReactNode }) {
	const query = useQuery({
		queryKey: [api.chat.$url().pathname],
		queryFn: async () => api.chat.$ws(),
		staleTime: Number.POSITIVE_INFINITY,
	});

	return (
		<ChatSocketContext.Provider value={query}>
			{children}
		</ChatSocketContext.Provider>
	);
}

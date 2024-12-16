import api from "@/lib/api";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { createContext, type ReactNode } from "react";

export const ChatSocketContext = createContext<
	UseQueryResult<WebSocket, Error> | undefined
>(undefined);

export function ChatSocketProvider({ children }: { children: ReactNode }) {
	const query = useQuery({
		queryKey: [api.socket.chat.$url().pathname],
		queryFn: async () => api.socket.chat.$ws(),
		staleTime: Number.POSITIVE_INFINITY,
	});

	return (
		<ChatSocketContext.Provider value={query}>
			{children}
		</ChatSocketContext.Provider>
	);
}

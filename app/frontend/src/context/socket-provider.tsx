import type WebSocketService from "@/features/realtime/ws-service";
import type { ClientToServerWsEventData } from "@shared/types";
import { createContext, useCallback, useContext, useEffect } from "react";

export const SocketContext = createContext<SocketContextType | undefined>(
	undefined,
);

export function SocketProvider({ children, ws }: SocketProviderProps) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: ws is stable
	const emit = useCallback((data: ClientToServerWsEventData) => {
		ws.sendMessage(data);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: ws is stable
	useEffect(() => {
		ws.connect();
		return () => ws.disconnect();
	}, []);

	return (
		<SocketContext.Provider
			value={{
				readyState: ws.readyState,
				sendMessage: emit,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
}

export function useSocket() {
	const context = useContext(SocketContext);

	if (context === undefined)
		throw new Error("useSocket must be used within a SocketProvider");

	return context;
}

type SocketContextType = {
	readyState: number;
	sendMessage: (data: ClientToServerWsEventData) => void;
};

type SocketProviderProps = React.PropsWithChildren & {
	ws: WebSocketService;
};

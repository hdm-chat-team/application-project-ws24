import { useWebSocketConnection, useWebSocketEvents } from "@/hooks";
import { type WSEventData, wsEventDataSchema } from "@shared/types";
import { type ReactNode, createContext, useCallback, useEffect } from "react";

type SocketContextType = {
	readyState: number;
	sendMessage: (data: WSEventData) => void;
};

export const SocketContext = createContext<SocketContextType | undefined>(
	undefined,
);

export function SocketProvider({ children }: { children: ReactNode }) {
	const sendWSMessage = useCallback((data: WSEventData) => {
		wsEventDataSchema.parse(data);
		console.log("sending", data);
		sendRawMessage(JSON.stringify(data));
	}, []);

	const { handleOpen, handleMessage } = useWebSocketEvents(sendWSMessage);
	const {
		connect,
		disconnect,
		sendMessage: sendRawMessage,
		readyState,
	} = useWebSocketConnection(handleOpen, handleMessage);

	useEffect(() => {
		connect();
		return () => disconnect();
	}, [connect, disconnect]);

	return (
		<SocketContext.Provider value={{ readyState, sendMessage: sendWSMessage }}>
			{children}
		</SocketContext.Provider>
	);
}

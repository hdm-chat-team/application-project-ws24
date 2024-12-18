import api from "@/lib/api";
import {
	type ReactNode,
	createContext,
	useEffect,
	useRef,
	useState,
} from "react";

export const SocketContext = createContext<
	| {
			socket: WebSocket | null;
			readyState: number;
	  }
	| undefined
>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
	const socketRef = useRef<WebSocket | null>(null);
	const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

	useEffect(() => {
		socketRef.current = api.socket.$ws();

		socketRef.current.onopen = () => {
			console.log("connected");
			setReadyState(WebSocket.OPEN);
		};

		socketRef.current.onmessage = (event) => {
			console.log("message", event.data);
		};

		socketRef.current.onerror = (event) => {
			console.error("error", event);
		};

		socketRef.current.onclose = () => {
			console.log("disconnected");
			setReadyState(WebSocket.CLOSED);
		};

		return () => {
			if (socketRef.current?.readyState === WebSocket.OPEN) {
				socketRef.current?.close();
			}
		};
	}, []);

	return (
		<SocketContext.Provider value={{ socket: socketRef.current, readyState }}>
			{children}
		</SocketContext.Provider>
	);
}

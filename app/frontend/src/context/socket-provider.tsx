import { userChatsQueryOptions } from "@/features/chat/queries";
import { db } from "@/features/db";
import api from "@/lib/api";
import type { Message } from "@server/db/messages";
import { useQueryClient } from "@tanstack/react-query";
import {
	type ReactNode,
	createContext,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

const RECONNECTION_ATTEMPTS = 5;
const MAX_RECONNECTION_DELAY = 10000;
const INITIAL_RECONNECTION_DELAY = 1000;

const WebSocketEvents = {
	OPEN: "open",
	MESSAGE: "message",
	ERROR: "error",
	CLOSE: "close",
} as const;
type WebSocketEventName =
	(typeof WebSocketEvents)[keyof typeof WebSocketEvents];

type SocketEventMap = {
	[WebSocketEvents.MESSAGE]: MessageEvent;
	[WebSocketEvents.CLOSE]: CloseEvent;
	[WebSocketEvents.ERROR]: Event;
	[WebSocketEvents.OPEN]: Event;
};

type SocketContextType = {
	socket: WebSocket | null;
	readyState: number;
	addEventListener: <K extends WebSocketEventName>(
		event: K,
		handler: (event: SocketEventMap[K]) => void,
	) => void;
	removeEventListener: <K extends WebSocketEventName>(
		event: K,
		handler: (event: SocketEventMap[K]) => void,
	) => void;
};

export const SocketContext = createContext<SocketContextType | undefined>(
	undefined,
);

export function SocketProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();

	const socketRef = useRef<WebSocket | null>(null);
	const reconnectAttemptRef = useRef(0);
	const reconnectTimeoutRef = useRef<NodeJS.Timer>();

	const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

	// * Event Handlers
	const handleOpen = useCallback(async () => {
		setReadyState(WebSocket.OPEN);
		reconnectAttemptRef.current = 0;
	}, []);

	const handleClose = useCallback(() => {
		toast.warning("🔌 WebSocket disconnected");
		setReadyState(WebSocket.CLOSED);

		if (reconnectAttemptRef.current < RECONNECTION_ATTEMPTS) {
			const timeout = Math.min(
				INITIAL_RECONNECTION_DELAY * 2 ** reconnectAttemptRef.current,
				MAX_RECONNECTION_DELAY,
			);
			console.log(`🔄 Attempting to reconnect in ${timeout / 1000} seconds...`);
			reconnectTimeoutRef.current = setTimeout(() => {
				reconnectAttemptRef.current += 1;
				connect();
			}, timeout);
		}
	}, []);

	// * Connection Management
	const connect = useCallback(() => {
		if (
			socketRef.current?.readyState === WebSocket.CONNECTING ||
			socketRef.current?.readyState === WebSocket.OPEN
		) {
			return;
		}
		socketRef.current = api.socket.$ws();
		socketRef.current.onopen = handleOpen;
		socketRef.current.onclose = handleClose;
	}, [handleOpen, handleClose]);

	// * Event Listener Management
	const addEventListener = useCallback(
		<K extends WebSocketEventName>(
			event: K,
			handler: (event: SocketEventMap[K]) => void,
		) => {
			if (socketRef.current) {
				socketRef.current.addEventListener(event, handler as EventListener);
			}
		},
		[],
	);

	const removeEventListener = useCallback(
		<K extends WebSocketEventName>(
			event: K,
			handler: (event: SocketEventMap[K]) => void,
		) => {
			if (socketRef.current) {
				socketRef.current.removeEventListener(event, handler as EventListener);
			}
		},
		[],
	);

	// * Provider DOM Lifecycle
	useEffect(() => {
		connect();
		return () => {
			if (socketRef.current?.readyState === WebSocket.OPEN) {
				socketRef.current.close();
			}
			clearTimeout(reconnectTimeoutRef.current);
		};
	}, [connect]);

	return (
		<SocketContext.Provider
			value={{
				socket: socketRef.current,
				readyState,
				addEventListener,
				removeEventListener,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
}

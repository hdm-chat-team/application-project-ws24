import api from "@/lib/api";
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

type WebSocketEventName = keyof typeof WebSocketEvents;
type SocketEventHandler = (event: Event) => void;

type SocketContextType = {
	socket: WebSocket | null;
	readyState: number;
	addEventListener: (
		event: WebSocketEventName,
		handler: SocketEventHandler,
	) => void;
	removeEventListener: (
		event: WebSocketEventName,
		handler: SocketEventHandler,
	) => void;
};

type SocketMessage = {
	[key: string]: unknown;
};

export const SocketContext = createContext<SocketContextType | undefined>(
	undefined,
);

export function SocketProvider({ children }: { children: ReactNode }) {
	const socketRef = useRef<WebSocket | null>(null);
	const reconnectAttemptRef = useRef(0);
	const reconnectTimeoutRef = useRef<NodeJS.Timer>();

	const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

	// * Event Handlers
	const handleOpen = useCallback(() => {
		console.log("✅ WebSocket connected");
		setReadyState(WebSocket.OPEN);
		reconnectAttemptRef.current = 0;
	}, []);

	const handleMessage = useCallback((event: MessageEvent) => {
		const data = JSON.parse(event.data) as SocketMessage;
		console.log("📨 WebSocket message", data);
	}, []);

	const handleError = useCallback((event: Event) => {
		console.error("❌ WebSocket error", event);
	}, []);

	const handleClose = useCallback(() => {
		console.log("🔌 WebSocket disconnected");
		setReadyState(WebSocket.CLOSED);

		if (reconnectAttemptRef.current < RECONNECTION_ATTEMPTS) {
			const timeout = Math.min(
				INITIAL_RECONNECTION_DELAY * 2 ** reconnectAttemptRef.current,
				MAX_RECONNECTION_DELAY,
			);
			console.log(`🔄 Attempting to reconnect in ${timeout}ms...`);
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
		console.log("🔌 Connecting to WebSocket...");
		socketRef.current = api.socket.$ws();
		socketRef.current.onopen = handleOpen;
		socketRef.current.onmessage = handleMessage;
		socketRef.current.onerror = handleError;
		socketRef.current.onclose = handleClose;
	}, [handleOpen, handleMessage, handleError, handleClose]);

	const addEventListener = useCallback(
		(event: WebSocketEventName, handler: SocketEventHandler) => {
			if (socketRef.current) {
				socketRef.current.addEventListener(event, handler);
			}
		},
		[],
	);

	const removeEventListener = useCallback(
		(event: WebSocketEventName, handler: SocketEventHandler) => {
			if (socketRef.current) {
				socketRef.current.removeEventListener(event, handler);
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

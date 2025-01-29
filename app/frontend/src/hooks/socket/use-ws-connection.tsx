import api from "@/lib/api";
import { useCallback, useRef, useState } from "react";

const RECONNECTION_ATTEMPTS = 5;
const MAX_RECONNECTION_DELAY = 10000;
const INITIAL_RECONNECTION_DELAY = 1000;

export function useWebSocketConnection(
	onOpen: () => void,
	onMessage: (event: MessageEvent) => void,
) {
	const socketRef = useRef<WebSocket | null>(null);
	const reconnectAttemptRef = useRef(0);
	const reconnectTimeoutRef = useRef<NodeJS.Timer | null>(null);
	const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

	const handleClose = useCallback(() => {
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

	const connect = useCallback(() => {
		if (
			socketRef.current?.readyState === WebSocket.CONNECTING ||
			socketRef.current?.readyState === WebSocket.OPEN
		) {
			return;
		}
		socketRef.current = api.socket.$ws();
		socketRef.current.onopen = () => {
			setReadyState(WebSocket.OPEN);
			reconnectAttemptRef.current = 0;
			onOpen();
		};
		socketRef.current.onmessage = onMessage;
		socketRef.current.onclose = handleClose;
	}, [handleClose, onMessage, onOpen]);

	const sendMessage = useCallback((data: string) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(data);
		}
	}, []);

	const disconnect = useCallback(() => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.close();
		}
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
		}
	}, []);

	return { connect, disconnect, sendMessage, readyState };
}

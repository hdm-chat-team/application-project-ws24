import { useSaveChats } from "@/features/chat/hooks";
import {
	chatByIdQueryOptions,
	syncChatsQueryOptions,
} from "@/features/chat/queries";
import {
	useSaveMessage,
	useSaveMessageBatch,
	useUpdateMessage,
} from "@/features/message/hooks";
import api from "@/lib/api";
import { type WSEventData, wsEventDataSchema } from "@shared/types";
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

type SocketContextType = {
	readyState: number;
	sendMessage: (data: WSEventData) => void;
};

export const SocketContext = createContext<SocketContextType | undefined>(
	undefined,
);

export function SocketProvider({ children }: { children: ReactNode }) {
	const socketRef = useRef<WebSocket | null>(null);
	const reconnectAttemptRef = useRef(0);
	const reconnectTimeoutRef = useRef<NodeJS.Timer>();

	const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

	const queryClient = useQueryClient();

	const saveMessage = useSaveMessage().mutate;
	const saveMessagesByChat = useSaveMessageBatch().mutate;
	const updateMessage = useUpdateMessage().mutate;
	const saveChats = useSaveChats().mutate;

	// * Event Handlers
	const handleOpen = useCallback(async () => {
		setReadyState(WebSocket.OPEN);
		reconnectAttemptRef.current = 0;

		const chats = await queryClient.fetchQuery(syncChatsQueryOptions);
		saveChats(chats);
	}, [queryClient, saveChats]);

	const handleMessage = useCallback(
		(event: MessageEvent) => {
			const data = wsEventDataSchema.parse(JSON.parse(event.data));

			switch (data.type) {
				case "message_sync": {
					const messages = data.payload;

					saveMessagesByChat(messages);

					break;
				}
				case "message_incoming": {
					const message = data.payload;
					saveMessage(message);
					sendMessage({
						type: "message_received",
						payload: { id: message.id, authorId: message.authorId },
					});

					// * sync chats when needed
					const chatSynched = queryClient.getQueryData(
						chatByIdQueryOptions(message.chatId).queryKey,
					);
					if (!chatSynched) queryClient.refetchQueries(syncChatsQueryOptions);

					break;
				}
				case "message_delivered": {
					const messageId = data.payload;
					updateMessage({
						messageId,
						state: "delivered",
					});

					break;
				}
				case "message_completed": {
					const messageId = data.payload;
					updateMessage({
						messageId,
						state: "read",
					});

					break;
				}
				default:
					console.log("unhandled message type", data.type);

					break;
			}
		},
		[queryClient, saveMessage, saveMessagesByChat, updateMessage],
	);

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
		socketRef.current.onmessage = handleMessage;
		socketRef.current.onclose = handleClose;
	}, [handleOpen, handleMessage, handleClose]);

	// * Message Sending
	const sendMessage = useCallback((data: WSEventData) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			wsEventDataSchema.parse(data);
			console.log("sending", data);
			socketRef.current.send(JSON.stringify(data));
		}
	}, []);

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
				readyState,
				sendMessage,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
}

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
import { type WSEventData, wsEventDataSchema } from "@shared/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useWebSocketEvents(sendMessage: (data: WSEventData) => void) {
	const queryClient = useQueryClient();

	const saveMessage = useSaveMessage().mutate;
	const saveMessagesByChat = useSaveMessageBatch().mutate;
	const updateMessage = useUpdateMessage().mutate;
	const saveChats = useSaveChats().mutate;

	const handleOpen = useCallback(async () => {
		const chats = await queryClient.fetchQuery(syncChatsQueryOptions);
		saveChats(chats);
	}, [queryClient, saveChats]);

	const handleMessage = useCallback(
		(event: MessageEvent) => {
			const data = wsEventDataSchema.parse(JSON.parse(event.data));
			console.log("receiving", data);

			switch (data.type) {
				case "message_sync": {
					saveMessagesByChat(data.payload);
					break;
				}
				case "message_incoming": {
					const message = data.payload;
					saveMessage({ message });
					sendMessage({
						type: "message_received",
						payload: { id: message.id, authorId: message.authorId },
					});

					const chatSynched = queryClient.getQueryData(
						chatByIdQueryOptions(message.chatId).queryKey,
					);
					if (!chatSynched) queryClient.refetchQueries(syncChatsQueryOptions);
					break;
				}
				case "message_delivered": {
					updateMessage({
						messageId: data.payload,
						state: "delivered",
					});
					break;
				}
				case "message_completed": {
					updateMessage({
						messageId: data.payload,
						state: "read",
					});
					break;
				}
				default:
					console.log("unhandled message type", data.type);
					break;
			}
		},
		[queryClient, saveMessage, saveMessagesByChat, updateMessage, sendMessage],
	);

	return { handleOpen, handleMessage };
}

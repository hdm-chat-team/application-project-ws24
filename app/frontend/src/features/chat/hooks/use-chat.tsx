import { userChatsQueryOptions } from "@/features/chat/queries";
import {
	useSaveMessage,
	useSaveMessageBatch,
	useUpdateMessage,
} from "@/features/message/hooks";
import { messagesByChatIdQueryOptions } from "@/features/message/queries";
import { useSocket } from "@/hooks";
import { wsEventDataSchema } from "@shared/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useSaveChats } from ".";

export function useChat(chatId: string) {
	const { addEventListener, removeEventListener, sendMessage } = useSocket();

	const queryClient = useQueryClient();

	const { data: messages, ...query } = useQuery(
		messagesByChatIdQueryOptions(chatId),
	);

	const saveChatMutation = useSaveChats();
	const saveMessageMutation = useSaveMessage(chatId);
	const saveMessagesByChatMutation = useSaveMessageBatch(chatId);
	const updateMessageMutation = useUpdateMessage(chatId);

	const handleOpen = useCallback(async () => {
		// TODO: fetch only chats newer than the last chat in the db
		const data = await queryClient.fetchQuery(userChatsQueryOptions);
		await saveChatMutation.mutateAsync(data);
	}, [queryClient, saveChatMutation.mutateAsync]);

	const handleMessage = useCallback(
		async (event: MessageEvent) => {
			const data = wsEventDataSchema.parse(JSON.parse(event.data));

			switch (data.type) {
				case "message_sync": {
					const messages = data.payload;

					await saveMessagesByChatMutation.mutateAsync(messages);
					break;
				}
				case "message_incoming": {
					const message = data.payload;
					await saveMessageMutation.mutateAsync(message);
					sendMessage({
						type: "message_received",
						payload: { id: message.id, authorId: message.authorId },
					});
					break;
				}
				case "message_delivered": {
					const messageId = data.payload;
					await updateMessageMutation.mutateAsync({
						messageId,
						state: "delivered",
					});
					break;
				}
				case "message_completed": {
					const messageId = data.payload;
					await updateMessageMutation.mutateAsync({
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
		[
			saveMessageMutation.mutateAsync,
			saveMessagesByChatMutation.mutateAsync,
			updateMessageMutation.mutateAsync,
			sendMessage,
		],
	);

	useEffect(() => {
		addEventListener("open", handleOpen);
		addEventListener("message", handleMessage);
		return () => {
			removeEventListener("message", handleMessage);
			removeEventListener("open", handleOpen);
		};
	}, [addEventListener, removeEventListener, handleMessage, handleOpen]);

	return { messages, query };
}

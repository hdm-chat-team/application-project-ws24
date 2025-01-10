import {
	messagesByChatIdQueryOptions,
	userChatsQueryOptions,
} from "@/features/chat/queries";
import { useSocket } from "@/hooks";
import { db } from "@/lib/db";
import { wsEventDataSchema } from "@shared/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useSaveMessage } from "./use-save-message";
import { useUpdateMessage } from "./use-update-message";

export function useChat(chatId: string) {
	const { addEventListener, removeEventListener, sendMessage } = useSocket();

	const queryClient = useQueryClient();
	const saveMessageMutation = useSaveMessage(chatId);
	const updateMessageMutation = useUpdateMessage(chatId);
	const { data: messages, ...query } = useQuery(
		messagesByChatIdQueryOptions(chatId),
	);

	const handleOpen = useCallback(async () => {
		// * Fetch user chats and store them in IndexedDB
		const data = await queryClient.fetchQuery(userChatsQueryOptions);
		await db.chats.bulkPut(data);
	}, [queryClient]);

	const handleMessage = useCallback(
		async (event: MessageEvent) => {
			const data = wsEventDataSchema.parse(JSON.parse(event.data));
			console.log("received", data);

			switch (data.type) {
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
					break;
			}
		},
		[
			saveMessageMutation.mutateAsync,
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

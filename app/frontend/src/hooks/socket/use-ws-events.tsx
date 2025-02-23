import { useSaveChat } from "@/features/chat/hooks";
import {
	chatByIdQueryOptions,
	syncChatsQueryOptions,
} from "@/features/chat/queries";
import {
	useSaveAttachment,
	useSaveMessage,
	useUpdateMessage,
} from "@/features/message/hooks";
import { localeTime } from "@/features/message/utils";
import { type WSEventData, wsEventDataSchema } from "@shared/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useWebSocketEvents(sendMessage: (data: WSEventData) => void) {
	const queryClient = useQueryClient();

	const saveMessage = useSaveMessage().mutate;
	const saveAttachment = useSaveAttachment().mutate;
	const updateMessage = useUpdateMessage().mutate;
	const saveChat = useSaveChat().mutate;

	const handleOpen = useCallback(async () => {
		console.log("connected");
	}, []);

	const handleMessage = useCallback(
		(event: MessageEvent) => {
			const data = wsEventDataSchema.parse(JSON.parse(event.data));
			console.log("receiving", data);

			switch (data.type) {
				case "sync:chats": {
					saveChat({
						...data.payload,
						syncState: "synced",
					});
					break;
				}
				case "sync:messages": {
					saveMessage({
						...data.payload,
						receivedAt: localeTime(),
					});
					sendMessage({
						type: "message:received",
						payload: { id: data.payload.id, authorId: data.payload.authorId },
					});
					break;
				}
				case "message:incoming": {
					const localMessage = {
						...data.payload,
						receivedAt: localeTime(),
					};
					saveMessage(localMessage);
					sendMessage({
						type: "message:received",
						payload: { id: localMessage.id, authorId: localMessage.authorId },
					});

					const chatSynched = queryClient.getQueryData(
						chatByIdQueryOptions(localMessage.chatId).queryKey,
					);
					if (!chatSynched) queryClient.refetchQueries(syncChatsQueryOptions);
					break;
				}
				case "message:attachment": {
					const attachment = data.payload;
					saveAttachment(attachment);
					break;
				}
				case "message:delivered": {
					updateMessage({
						id: data.payload,
						state: "delivered",
					});
					break;
				}
				case "message:completed": {
					updateMessage({
						id: data.payload,
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
			queryClient,
			saveMessage,
			saveAttachment,
			updateMessage,
			sendMessage,
			saveChat,
		],
	);

	return { handleOpen, handleMessage };
}

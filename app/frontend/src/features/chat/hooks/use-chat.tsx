import { messagesByChatIdQueryOptions } from "@/features/chat/queries";
import { useSocket } from "@/hooks";
import type { Message } from "@server/db/messages";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useSaveMessage } from "./use-save-message";

export function useChat(chatId: string) {
	const { addEventListener, removeEventListener } = useSocket();

	const queryClient = useQueryClient();
	const saveMessageMutation = useSaveMessage(chatId);
	const { data: messages, ...query } = useQuery(
		messagesByChatIdQueryOptions(chatId),
	);

	const handleMessage = useCallback(
		async (event: MessageEvent) => {
			const message: Message = JSON.parse(event.data);

			if (message?.chatId === chatId) {
				await saveMessageMutation.mutateAsync(message);
				queryClient.invalidateQueries({ queryKey: [chatId] });
			}
		},
		[chatId, saveMessageMutation.mutateAsync, queryClient],
	);

	useEffect(() => {
		addEventListener("message", handleMessage);
		return () => {
			removeEventListener("message", handleMessage);
		};
	}, [addEventListener, removeEventListener, handleMessage]);

	return { messages, query };
}

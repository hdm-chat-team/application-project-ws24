import { db } from "@/features/db";
import { messagesByChatIdQueryOptions } from "@/features/db/queries";
import { useSocket } from "@/hooks";
import { type Message, parseMessage } from "@shared/message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

export function useChat(chatId: string) {
	const queryClient = useQueryClient();
	const { addEventListener, removeEventListener, ...context } = useSocket();
	
	const {
		data: messages,
		isLoading,
		...query
	} = useQuery(messagesByChatIdQueryOptions(chatId));

	const mutation = useMutation({
		mutationKey: ["saveMessage"],
		mutationFn: async (message: Message) => {
			await db.messages.add(message);
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["db/messages-by-chat"] }),
	});

	const handleMessage = useCallback(
		async (event: MessageEvent) => {
			const message: Message = parseMessage(event.data);

			if (message?.chatId === chatId) {
				queryClient.invalidateQueries(messagesByChatIdQueryOptions(chatId));
				await mutation.mutateAsync(message);
			}
		},
		[chatId, mutation.mutateAsync, queryClient],
	);

	useEffect(() => {
		addEventListener("message", handleMessage);
		return () => {
			removeEventListener("message", handleMessage);
		};
	}, [addEventListener, removeEventListener, handleMessage]);

	return { messages, isLoading, ...context, query };
}

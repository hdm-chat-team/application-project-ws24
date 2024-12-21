import { db } from "@/features/db";
import { messagesQuery } from "@/features/db/queries";
import { useSocket } from "@/hooks";
import { type Message, parseMessage } from "@shared/message";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export function useChat() {
	const { addEventListener, removeEventListener, ...context } = useSocket();
	const [messages, setMessages] = useState<Message[]>([]);
	const { data, isSuccess } = useQuery(messagesQuery);

	// * Event Handlers
	const handleOpen = useCallback(async () => {
		if (isSuccess) {
			const storedMessages = data as Message[];
			setMessages(storedMessages);
		}
	}, [data, isSuccess]);

	const handleMessage = useCallback(async (event: Event) => {
		const messageEvent = event as MessageEvent;
		const message: Message = parseMessage(messageEvent.data);
		if (message?.id) {
			setMessages((prevMessages) => [...prevMessages, message]);
			await db.messages.add(message);
		}
	}, []);

	// * Component Lifecycle
	useEffect(() => {
		addEventListener("open", handleOpen);
		addEventListener("message", handleMessage);

		return () => {
			removeEventListener("open", handleOpen);
			removeEventListener("message", handleMessage);
		};
	}, [addEventListener, removeEventListener, handleOpen, handleMessage]);

	return { messages, ...context };
}

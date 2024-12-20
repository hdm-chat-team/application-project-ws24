import { SocketContext } from "@/context/socket-provider";
import { db } from "@/features/db";
import { type Message, parseMessage } from "@shared/message";
import { useCallback, useContext, useEffect, useState } from "react";

export function useChat() {
	const context = useContext(SocketContext);
	if (context === undefined)
		throw new Error("useConnection must be used within a SocketProvider");

	const { addEventListener, removeEventListener } = context;

	const [messages, setMessages] = useState<Message[]>([]);

	const handleOpen = useCallback(async () => {
		const storedMessages = await db.messages.toArray();
		setMessages(storedMessages);
	}, []);

	const handleMessage = useCallback(async (event: Event) => {
		try {
			const messageEvent = event as MessageEvent;
			const message: Message = parseMessage(messageEvent.data);
			if (message?.id) {
				setMessages((prevMessages) => [...prevMessages, message]);
				await db.messages.add(message);
			}
		} catch (error) {
			console.error("Failed to parse message:", error);
		}
	}, []);

	useEffect(() => {
		addEventListener("open", handleOpen);
		addEventListener("message", handleMessage);

		return () => {
			removeEventListener("open", handleOpen);
			removeEventListener("message", handleMessage);
		};
	}, [addEventListener, removeEventListener, handleOpen, handleMessage]);

	return { messages, context };
}

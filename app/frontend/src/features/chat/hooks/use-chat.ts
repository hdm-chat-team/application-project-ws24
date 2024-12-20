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
		const messageEvent = event as MessageEvent;
		const message: Message = parseMessage(messageEvent.data);
		if (message?.id) {
			setMessages((prevMessages) => [...prevMessages, message]);
			await db.messages.add(message);
		}
	}, []);

	useEffect(() => {
		addEventListener("OPEN", handleOpen);
		addEventListener("MESSAGE", handleMessage);

		return () => {
			removeEventListener("OPEN", handleOpen);
			removeEventListener("MESSAGE", handleMessage);
		};
	}, [addEventListener, removeEventListener, handleOpen, handleMessage]);

	return { messages, context };
}

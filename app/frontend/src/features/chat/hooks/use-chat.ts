import { SocketContext } from "@/context/socket-provider";
import { type Message, parseMessage } from "@shared/message";
import { useContext, useEffect, useState } from "react";

export function useChat() {
	const context = useContext(SocketContext);
	if (context === undefined)
		throw new Error("useConnection must be used within a SocketProvider");
	const { socket } = context;

	const [messages, setMessages] = useState<Message[]>([]);

	useEffect(() => {
		if (socket) {
			socket.onmessage = (event) => {
				try {
					const message: Message = parseMessage(event.data);
					if (message?.id) {
						setMessages((prevMessages) => [...prevMessages, message]);
					}
				} catch (error) {
					console.error("Failed to parse message:", error);
				}
			};

			return () => {
				socket.onmessage = null;
			};
		}
	}, [socket]);

	return { messages, context };
}

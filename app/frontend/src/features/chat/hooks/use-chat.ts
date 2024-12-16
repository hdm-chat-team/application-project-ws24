import { useContext, useState } from "react";
import { ChatSocketContext } from "@/features/chat/context/chat-provider";

export function useChatSocket() {
	const context = useContext(ChatSocketContext);
	if (context === undefined)
		throw new Error("useConnection must be used within a ChatSocketProvider");
	const { data: chatSocket, ...rest } = context;

	const [messages, setMessages] = useState<string[]>([]);

	if (chatSocket) {
		chatSocket.onopen = (event) => {
			console.log("ChatSocket client opened", event);
		};

		chatSocket.onmessage = (event) => {
			console.log("ChatSocket client received message", event);
			setMessages((prevMessages) => [...prevMessages, event.data]);
		};

		chatSocket.onclose = (event) => {
			console.log("ChatSocket client closed", event);
		};
	}

	return { messages, chatSocket, ...rest };
}

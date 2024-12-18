import MessageInput from "@/features/chat/components/message-input";
import { useMessageService } from "@/features/chat/hooks/use-message-service";
import { type Message, messageDb } from "@/features/db";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createLazyFileRoute("/(wip)/test-page")({
	component: TestPage,
});

function TestPage() {
	const [receivedMessage, setReceivedMessage] = useState<string>("");
	const [messages, setMessages] = useState<Message[]>([]);
	const { addReceivedMessage } = useMessageService();

	useEffect(() => {
		const fetchMessages = async () => {
			const allMessages: Message[] = await messageDb.messages.toArray();
			setMessages(allMessages);
		};
		fetchMessages();
	}, []);

	const handleReceiveMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
		setReceivedMessage(e.target.value);
	};

	const handleSaveMessage = async () => {
		if (receivedMessage.trim() === "") {
			alert("Message is empty");
			return;
		}
		await addReceivedMessage(receivedMessage);
		setReceivedMessage("");
		const allMessages: Message[] = await messageDb.messages.toArray();
		setMessages(allMessages);
	};

	return (
		<div>
			<h1>Test Page for local db tests</h1>
			<MessageInput />
			<input
				type="text"
				value={receivedMessage}
				onChange={handleReceiveMessage}
				placeholder="type in the received message"
			/>
			<button type="button" onClick={handleSaveMessage}>
				Nachricht speichern
			</button>
			<ul>
				{messages.map((msg: Message) => (
					<li key={msg.id}>{msg.content}</li>
				))}
			</ul>
		</div>
	);
}

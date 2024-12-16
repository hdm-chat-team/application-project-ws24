import { createFileRoute } from "@tanstack/react-router";
import { ChatSocketProvider } from "@/features/chat/context/chat-provider";
import { useState, type FormEvent } from "react";
import { useChatSocket } from "@/features/chat/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/(app)/_authenticated/chat")({
	component: () => (
		<ChatSocketProvider>
			<Chat />
		</ChatSocketProvider>
	),
});

function Chat() {
	const { messages, chatSocket } = useChatSocket();

	const [inputMessage, setInputMessage] = useState("");

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		if (inputMessage && chatSocket) {
			chatSocket.send(inputMessage);
		}

		setInputMessage("");
	}

	return (
		<>
			<h1>Chat</h1>
			<div>
				<h2>Chat Messages</h2>
				<ul>
					{messages.map((message) => (
						<li key={message}>{message}</li>
					))}
				</ul>
				<h2>Chat Socket Status: {chatSocket?.readyState}</h2>

				<form onSubmit={handleSubmit}>
					<Input
						type="text"
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						placeholder="Type your message"
					/>
					<Button type="submit">Send</Button>
				</form>
			</div>
		</>
	);
}

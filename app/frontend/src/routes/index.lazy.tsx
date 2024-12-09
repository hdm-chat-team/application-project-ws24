import { Button } from "@/components/ui/button";
import { useMessageService } from "@/hooks/use-message-service";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

// TODO: Implement logic so messages are loaded from the database

function Index() {
	const [messages, setMessages] = useState<string[]>([]);
	const socketRef = useRef<WebSocket | null>(null);
	const [inputMessage, setInputMessage] = useState("");
	const { addReceivedMessage, addMessage } = useMessageService();

	useEffect(() => {
		const socket = api.chat.$ws();
		socketRef.current = socket;

		socket.onopen = (event) => {
			console.log("WebSocket client opened", event);
		};

		socket.onmessage = async (event) => {
			console.log("WebSocket client received message", event);
			const message = JSON.parse(event.data);
			addReceivedMessage(message.content);
			setMessages((prevMessages) => [...prevMessages, event.data]);
		};

		return () => {
			socket.close();
		};
	}, [addReceivedMessage]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (socketRef.current && inputMessage) {
			socketRef.current.send(inputMessage);
			await addMessage(inputMessage);
			setInputMessage("");
		}
	};

	const { data, isPending } = useQuery({
		queryKey: ["data"],
		queryFn: fetchData,
	});

	return (
		<div>
			<h1 className="text-3xl text-blue-300">
				{isPending ? "Loading..." : data}
			</h1>
			<div>
				<h2>Chat Messages</h2>
				<ul>
					{messages.map((message) => (
						<li key={message}>{message}</li>
					))}
				</ul>
			</div>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					placeholder="Type your message"
				/>
				<Button type="submit">Send</Button>
			</form>
			<Button asChild>
				<a href={api.auth.github.$url().toString()}>signin</a>
			</Button>
			<Button asChild>
				<a href={api.auth.signout.$url().toString()}>signout</a>
			</Button>
		</div>
	);
}

async function fetchData() {
	const response = await api.$get();
	if (!response.ok) {
		throw new Error("Failed to fetch data");
	}
	return response.text();
}

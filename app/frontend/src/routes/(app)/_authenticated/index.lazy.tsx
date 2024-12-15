import { Button } from "@/components/ui/button";
import { useUser } from "@/features/auth";
import { SignoutButton } from "@/features/auth/components/signout-button";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createLazyFileRoute("/(app)/_authenticated/")({
	component: Index,
});

// TODO: Implement logic so messages are loaded from the database

function Index() {
	const { user } = useUser();
	const [messages, setMessages] = useState<string[]>([]);
	const socketRef = useRef<WebSocket | null>(null);
	const [inputMessage, setInputMessage] = useState("");

	useEffect(() => {
		const socket = api.chat.$ws();
		socketRef.current = socket;

		socket.onopen = (event) => {
			console.log("WebSocket client opened", event);
		};

		socket.onmessage = async (event) => {
			console.log("WebSocket client received message", event);
			setMessages((prevMessages) => [...prevMessages, event.data]);
		};

		return () => {
			socket.close();
		};
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (socketRef.current && inputMessage) {
			console.log("Sending message", inputMessage);
			socketRef.current.send(inputMessage);
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
			<h1>You are logged in as: {user?.username} </h1>
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
			<SignoutButton />
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

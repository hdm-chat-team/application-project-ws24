import ChatContent from "@/components/chat/chat";
import Demo from "@/components/demo";
import TopNav from "@/components/nav/top-nav";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { users } from "@/data/data";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	const [messages, setMessages] = useState<
		{ id: string; sender: string; content: string; timestamp: string }[]
	>([]);
	const socketRef = useRef<WebSocket | null>(null);
	const [inputMessage, setInputMessage] = useState("");
	const [selectedUser, setSelectedUser] = useState<string | null>(null);

	useEffect(() => {
		const socket = api.chat.$ws();
		socketRef.current = socket;

		socket.onopen = (event) => {
			console.log("WebSocket client opened", event);
		};

		socket.onmessage = (event) => {
			console.log("WebSocket client received message", event);
			setMessages((prevMessages) => [
				...prevMessages,
				{
					id: `msg-${prevMessages.length + 1}`,
					sender: "user",
					content: event.data,
					timestamp: new Date().toLocaleTimeString(),
				},
			]);
		};

		return () => {
			socket.close();
		};
	}, []);

	const handleSelectUser = (id: string) => {
		setSelectedUser(id);
		setMessages([
			{
				id: "m1",
				sender: "user",
				content: `Hey, wie läuft's? ${id}`,
				timestamp: "22:41",
			},
			{ id: "m2", sender: "me", content: "Haha, fast!", timestamp: "22:42" },
		]);
	};

	const handleSendMessage = (message: string) => {
		if (socketRef.current && message.trim()) {
			socketRef.current.send(message);
		}
		setMessages((prev) => [
			...prev,
			{
				id: `m${prev.length + 1}`,
				sender: "me",
				content: message,
				timestamp: new Date().toLocaleTimeString(),
			},
		]);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (socketRef.current && inputMessage.trim()) {
			socketRef.current.send(inputMessage);
			setMessages((prev) => [
				...prev,
				{
					id: `m${prev.length + 1}`,
					sender: "me",
					content: inputMessage,
					timestamp: new Date().toLocaleTimeString(),
				},
			]);
			setInputMessage("");
		}
	};

	const { data, isPending } = useQuery({
		queryKey: ["data"],
		queryFn: fetchData,
	});

	return (
		<div>
			<TopNav />
			<div className="flex h-screen">
				<Sidebar users={users} onSelectUser={handleSelectUser} />
				{selectedUser && (
					<ChatContent
						messages={messages}
						onSendMessage={handleSendMessage}
						handleSubmit={handleSubmit}
						inputMessage={inputMessage}
						setInputMessage={setInputMessage}
					/>
				)}
			</div>
			{/*
			
			<h1 className="text-3xl text-blue-300">
				{isPending ? "Loading..." : data}
			</h1>
			 */}
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

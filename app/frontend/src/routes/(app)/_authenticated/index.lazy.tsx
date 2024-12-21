import ChatContent from "@/components/chat/chat";
import TopNav from "@/components/nav/top-nav";
import Sidebar from "@/components/sidebar";
import { users } from "@/data/data";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createLazyFileRoute("/(app)/_authenticated/")({
	component: Index,
});

function Index() {
	const [messages, setMessages] = useState<
		{ id: string; sender: string; content: string; timestamp: string }[]
	>([]);
	const socketRef = useRef<WebSocket | null>(null);
	const [inputMessage, setInputMessage] = useState("");

	const [selectedUser, setSelectedUser] = useState<{
		id: string;
		username: string;
		profilePicture?: string;
	} | null>(null);

	useEffect(() => {
		const socket = api.chat.$ws();
		socketRef.current = socket;

		socket.onopen = (event: Event) => {
			console.log("WebSocket client opened", event);
		};

		socket.onmessage = (event: MessageEvent) => {
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
		const user = users.find((user) => user.id === id);
		if (user) {
			setSelectedUser({
				id: user.id,
				username: user.name,
				profilePicture: user.profilePicture, // Assume profilePicture exists in `users` data
			});
		}
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
						username={selectedUser.username}
						profilePicture={selectedUser.profilePicture}
					/>
				)}
			</div>
			{/*<h1 className="text-3xl text-blue-300">
				{isPending ? "Loading..." : data}
			</h1>*/}
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

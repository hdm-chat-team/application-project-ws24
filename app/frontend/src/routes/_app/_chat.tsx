import ChatContent from "@/components/chat/chat";
import TopNav from "@/components/nav/top-nav";
import Sidebar from "@/components/sidebar";
import { createFileRoute } from "@tanstack/react-router";
// import { useUser } from "@/features/auth";

export const Route = createFileRoute("/_app/_chat")({
	component: Index,
});

function Index() {
	// const { user, profile } = useUser(); // BIGBT MIR MEINE USERDATEN ZURÜCK, BRAUCH ICH DAS?

	//dummy data
	const fakeChats = [
		{
			id: "1",
			name: "Alice",
			message: "Hey, wie geht's?",
			timestamp: "10:30 AM",
			unreadCount: 2,
		},
		{
			id: "2",
			name: "Bob",
			message: "Hast du die Präsentation gesehen?",
			timestamp: "9:15 AM",
			unreadCount: 0,
		},
		{
			id: "3",
			name: "Charlie",
			message: "Kommst du heute Abend vorbei?",
			timestamp: "8:45 AM",
			unreadCount: 5,
		},
	];

	const fakeMessages = [
		{
			id: "1",
			sender: "Alice",
			content: "Hey, wie läuft's bei dir?",
			timestamp: "10:31 AM",
		},
		{
			id: "2",
			sender: "me",
			content: "Hey Alice! Alles gut, danke. Bei dir?",
			timestamp: "10:32 AM",
		},
		{
			id: "3",
			sender: "Alice",
			content: "Super! Freue mich auf später 😊",
			timestamp: "10:33 AM",
		},
		{
			id: "4",
			sender: "me",
			content: "Cool, bis dann! 🎉",
			timestamp: "10:34 AM",
		},
	];

	const handleSendMessage = (message: string) => {
		console.log("Message sent:", message);
	};

	const handleSelectUser = (id: string) => {
		console.log("Selected User ID:", id);
	};

	const handleSearchUser = (searchQuery: string) => {
		console.log("Search Query:", searchQuery);
	};

	return (
		<div>
			<TopNav />
			<div className="flex">
				<Sidebar
					users={fakeChats}
					onSelectUser={handleSelectUser}
					onSearchUser={handleSearchUser}
				/>
				{/* <pre>{JSON.stringify({ user, profile }, null, 2)}</pre> */}
				<ChatContent
					messages={fakeMessages}
					onSendMessage={handleSendMessage}
					username="Alice"
					//profilePicture=""
				/>
			</div>
		</div>
	);
}

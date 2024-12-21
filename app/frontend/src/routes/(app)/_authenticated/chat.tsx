import MessageForm from "@/features/chat/components/message-form";
import { useChat } from "@/features/chat/hooks/use-chat";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/_authenticated/chat")({
	component: () => <Chat />,
});

function Chat() {
	const { messages, readyState } = useChat();

	return (
		<>
			<h1>Chat</h1>
			<Link to="/">start page</Link>
			<div>
				<h2>Chat Messages</h2>
				<h2>Chat Socket Status: {readyState}</h2>
				<ul>
					{messages.map((message) => (
						<li key={message.id}>
							{message.authorId}: {message.body}
						</li>
					))}
				</ul>
				<MessageForm />
			</div>
		</>
	);
}

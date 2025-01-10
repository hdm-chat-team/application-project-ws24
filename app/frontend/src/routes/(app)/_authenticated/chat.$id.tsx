import { useUser } from "@/features/auth";
import { Message } from "@/features/chat/components/message";
import MessageForm from "@/features/chat/components/message-form";
import { useChat } from "@/features/chat/hooks";
import { messagesByChatIdQueryOptions } from "@/features/chat/queries";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/_authenticated/chat/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		queryClient
			.ensureQueryData(messagesByChatIdQueryOptions(id))
			.catch((error) => {
				console.error(error);
			});
	},
	component: () => <Chat />,
});

function Chat() {
	const chatId = Route.useParams().id;
	const { messages } = useChat(chatId);
	const { user } = useUser();

	return (
		<>
			<h1>Chat</h1>
			<Link to="/">start page</Link>
			<div>
				<h2>Chat Messages</h2>
				<ul className="mx-3">
					{messages.map((message) => (
						<li key={message.id}>
							<Message
								value={message}
								variant={message.authorId === user.id ? "sent" : "received"}
							/>
						</li>
					))}
				</ul>
				<MessageForm chatId={chatId} />
			</div>
		</>
	);
}

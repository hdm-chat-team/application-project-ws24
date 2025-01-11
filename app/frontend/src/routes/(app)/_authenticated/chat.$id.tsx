import { useUser } from "@/features/auth";
import { useChat } from "@/features/chat/hooks";
import { Message, MessageForm } from "@/features/message/components";
import { messagesByChatIdQueryOptions } from "@/features/message/queries";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/_authenticated/chat/$id")({
	loader: ({ context: { queryClient }, params: { id } }) => {
		queryClient.ensureQueryData(messagesByChatIdQueryOptions(id));
	},
	component: () => <Chat />,
});

function Chat() {
	const { id: chatId } = Route.useParams();
	const { user } = useUser();
	useChat();

	const { data: messages } = useQuery(messagesByChatIdQueryOptions(chatId));

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

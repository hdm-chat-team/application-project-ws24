import { useUser } from "@/features/auth";
import { Message, MessageForm } from "@/features/message/components";
import { messagesByChatIdQueryFn } from "@/features/message/queries";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";

export const Route = createFileRoute("/(app)/_authenticated/chat/$id")({
	loader: async ({ params: { id } }) => await messagesByChatIdQueryFn(id),
	component: () => <Chat />,
});

function Chat() {
	const { id: chatId } = Route.useParams();
	const { user } = useUser();

	const messages = useLiveQuery(
		() => messagesByChatIdQueryFn(chatId),
		[chatId],
	);

	return (
		<>
			<h1>Chat</h1>
			<Link to="/">start page</Link>
			<div>
				<h2>Chat Messages</h2>
				<ul className="mx-3">
					{messages?.map((message) => (
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

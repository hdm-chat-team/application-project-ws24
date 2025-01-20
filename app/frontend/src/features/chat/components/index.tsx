import { useUser } from "@/features/auth/hooks";
import { Message, MessageForm } from "@/features/message/components";
import { messagesByChatIdQueryFn } from "@/features/message/queries";
import { useLiveQuery } from "dexie-react-hooks";
import { useChat } from "../context";

export * from "./header";

export function Chat() {
	const { chat } = useChat();

	if (!chat) {
		return (
			<div className="flex size-full items-center justify-center">
				Open a chat to start messaging
			</div>
		);
	}

	return (
		<div className="relative flex size-full flex-col">
			<div className="flex-1 overflow-auto">
				<MessagesSection chatId={chat.id} />
			</div>
			<div className="relative border-t bg-background p-4">
				<MessageForm chatId={chat.id} />
			</div>
		</div>
	);
}

function MessagesSection({ chatId }: { chatId: string }) {
	const { user } = useUser();
	const messages = useLiveQuery(
		() => messagesByChatIdQueryFn(chatId),
		[chatId],
	);

	return (
		<ol id="messages" className="mx-3">
			{messages?.map((message) => (
				<li key={message.id}>
					<Message
						value={message}
						variant={message.authorId === user.id ? "sent" : "received"}
					/>
				</li>
			))}
		</ol>
	);
}

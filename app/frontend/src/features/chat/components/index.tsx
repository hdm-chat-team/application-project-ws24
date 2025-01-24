import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/features/auth/hooks";
import { Message, MessageForm } from "@/features/message/components";
import { messagesByChatIdQueryFn } from "@/features/message/queries";
import { useLiveQuery } from "dexie-react-hooks";
import { useChat } from "../context";

export * from "./header";

export function Chat() {
	const { chat } = useChat();

	return !chat ? (
		<div className="flex size-full items-center justify-center">
			Open a chat to start messaging
		</div>
	) : (
		<div className="relative flex size-full flex-col justify-end">
			<MessagesScrollArea
				chatId={chat.id}
				className="m-3 flex-1 overflow-auto"
			/>

			<div className="relative border-t bg-background p-4">
				<MessageForm chatId={chat.id} />
			</div>
		</div>
	);
}

function MessagesScrollArea({
	chatId,
	className,
}: { chatId: string; className?: string }) {
	/* 
	 TODO: Scroll behavior on new message
	*/
	const { user } = useUser();
	const messages = useLiveQuery(
		() => messagesByChatIdQueryFn(chatId),
		[chatId],
	);

	return (
		<ScrollArea>
			<ol className={className}>
				{messages?.map((message) => (
					<li key={message.id}>
						<Message
							value={message}
							variant={message.authorId === user.id ? "sent" : "received"}
						/>
					</li>
				))}
			</ol>
		</ScrollArea>
	);
}

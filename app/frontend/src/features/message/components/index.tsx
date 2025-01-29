import { useUser } from "@/features/auth/hooks";
import { useMessageState } from "@/features/message/hooks";
import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@server/db/messages";
import { MessageAttachments } from "./message-attachment";
import { MessageStateIcon } from "./message-state-icon";

export * from "./message-form";

type MessageBubbleProps = {
	value: MessageType;
};

export function Message({
	value: { id, body, authorId, state },
}: MessageBubbleProps) {
	const ref = useMessageState({ id, authorId });
	const { user } = useUser();
	const isSent = user?.id === authorId;

	return (
		<div
			ref={ref}
			className={cn("mb-4 flex", isSent ? "justify-end" : "justify-start")}
		>
			<article
				className={cn(
					"max-w-[70%] rounded-lg p-3",
					isSent ? "bg-primary text-primary-foreground" : "bg-muted",
				)}
			>
				<MessageAttachments messageId={id} />
				<p className="mt-2 break-words text-sm">{body}</p>
				{isSent && <MessageStateIcon state={state} />}
			</article>
		</div>
	);
}

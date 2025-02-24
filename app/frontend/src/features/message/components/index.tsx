import { useUser } from "@/features/auth/hooks";
import { useMessageState } from "@/features/message/hooks";
import type { LocalMessage } from "@/features/message/utils";
import { cn } from "@/lib/utils";
import { MessageAttachments } from "./message-attachment";
import { MessageStateIcon } from "./message-state-icon";

export * from "./message-form";

type MessageBubbleProps = {
	value: LocalMessage;
};

export function Message({
		value: { id, body, authorId, state, receivedAt, attachmentId: fileId },
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
					{fileId && <MessageAttachments customId={fileId} />}
					<p className="mt-2 break-words text-sm">{body}</p>
					<div className="mt-1 flex items-center justify-end gap-1">
						<span className="text-muted-foreground text-xs">{receivedAt}</span>
						{isSent && <MessageStateIcon state={state} />}
					</div>
				</article>
			</div>
		);
	}

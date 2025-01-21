import { useMessageState } from "@/features/message/hooks";
import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@server/db/messages";
import { Check, CheckCheck, ClockArrowUp, FileIcon } from "lucide-react";

type MessageBubbleProps = {
	value: MessageType & {
		attachments?: Array<{
			url: string;
			type: "image" | "video" | "document";
		}>;
	};
	variant?: "received" | "sent";
};

export default function Message({
	value: { id, body, authorId, state, attachments },
	variant = "received",
}: MessageBubbleProps) {
	const ref = useMessageState({ id, authorId });

	return (
		<div
			ref={ref}
			className={cn(
				"mb-4 flex",
				variant === "sent" ? "justify-end" : "justify-start",
			)}
		>
			<div
				className={cn(
					"max-w-[70%] rounded-lg p-3",
					variant === "sent"
						? "bg-primary text-primary-foreground"
						: "bg-muted",
				)}
			>
				{/* Attachment rendering */}
				{attachments?.map((attachment) => (
					<div key={attachment.url} className="space-y-2">
						{attachment.type === "image" && (
							<div className="relative max-h-[300px] max-w-[280px] overflow-hidden rounded-lg">
								<img
									src={attachment.url}
									alt=""
									className="h-auto w-full object-contain"
									loading="lazy"
								/>
							</div>
						)}
						{attachment.type === "video" && (
							<div className="relative max-h-[300px] max-w-[280px] overflow-hidden rounded-lg">
								<video
									src={attachment.url}
									controls
									className="h-auto w-full"
									preload="metadata"
								>
									<track kind="captions" src="" label="Captions" />
								</video>
							</div>
						)}
						{attachment.type === "document" && (
							<a
								href={attachment.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 rounded bg-black/10 p-2 hover:bg-black/20"
							>
								<FileIcon className="size-4" />
								<span className="text-sm">Download Document</span>
							</a>
						)}
					</div>
				))}

				{/* Attachment Text */}
				{body && <div className="mt-2 break-words text-sm">{body}</div>}

				{/* Status Icons */}
				<div className="mt-1 flex items-center justify-end gap-1">
					{variant === "sent" && (
						<span className="text-xs">
							{state === "read" ? (
								<CheckCheck className="size-4" color="blue" />
							) : state === "delivered" ? (
								<CheckCheck className="size-4" />
							) : state === "sent" ? (
								<Check className="size-4" />
							) : (
								<ClockArrowUp className="size-4" />
							)}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

import { useMessageState } from "@/features/message/hooks";
import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@server/db/messages";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, CheckCheck, ClockArrowUp, FileIcon } from "lucide-react";
import { attachmentsByMessageIdQueryFn } from "../queries";

export * from "./message-form";

type MessageBubbleProps = {
	value: MessageType;
	variant?: "received" | "sent";
};

export function Message({
	value: { id, body, authorId, state },
	variant = "received",
}: MessageBubbleProps) {
	const ref = useMessageState({ id, authorId });

	const attachments = useLiveQuery(
		() => attachmentsByMessageIdQueryFn(id),
		[id],
	);

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
						{attachment.type.startsWith("image") && (
							<div className="relative max-h-[300px] max-w-[280px] overflow-hidden rounded-lg">
								<img
									src={
										attachment.blob
											? URL.createObjectURL(attachment.blob)
											: attachment.url
									}
									alt=""
									className="h-auto w-full object-contain"
									loading="lazy"
								/>
							</div>
						)}
						{attachment.type.startsWith("video") && (
							<div className="relative max-h-[300px] max-w-[280px] overflow-hidden rounded-lg">
								<video
									src={
										attachment.blob
											? URL.createObjectURL(attachment.blob)
											: attachment.url
									}
									controls
									className="h-auto w-full"
									preload="metadata"
								>
									<track kind="captions" src="" label="Captions" />
								</video>
							</div>
						)}
						{attachment.type.startsWith("application") && (
							<a
								href={
									attachment.blob
										? URL.createObjectURL(attachment.blob)
										: attachment.url
								}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 rounded bg-black/10 p-2 hover:bg-black/20"
							>
								<FileIcon className="size-4" />
								<span className="text-sm">Document</span>
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

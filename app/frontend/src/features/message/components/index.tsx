import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@server/db/messages";
import { Check, CheckCheck, ClockArrowUp } from "lucide-react";
import { useMessageState } from "../hooks";

type MessageBubbleProps = {
	value: MessageType;
	variant?: "received" | "sent";
};

export function Message({
	value: { id, body, authorId, state },
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
				<div className="break-words text-sm">{body}</div>
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

export * from "./message-form";

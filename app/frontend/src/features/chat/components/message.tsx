import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@server/db/messages";
import { Check, CheckCheck, ClockArrowUp } from "lucide-react";

interface MessageBubbleProps {
	value: MessageType;
	variant?: "received" | "sent";
}

export default function Message({
	value,
	variant = "received",
}: MessageBubbleProps) {
	return (
		<div
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
				<div className="break-words text-sm">{value.body}</div>
				<div className="mt-1 flex items-center justify-end gap-1">
					{variant === "sent" && (
						<span className="text-xs">
							{value.state === "read" ? (
								<CheckCheck className="h-4 w-4" color="blue" />
							) : value.state === "delivered" ? (
								<CheckCheck className="h-4 w-4" />
							) : value.state === "sent" ? (
								<Check className="h-4 w-4" />
							) : (
								<ClockArrowUp className="h-4 w-4" />
							)}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

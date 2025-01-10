import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useSocket } from "@/hooks/use-socket";
import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@server/db/messages";
import { Check, CheckCheck, ClockArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";

interface MessageBubbleProps {
	value: MessageType;
	variant?: "received" | "sent";
}

export default function Message({
	value,
	variant = "received",
}: MessageBubbleProps) {
	const { sendMessage } = useSocket();

	const messageRef = useRef<HTMLDivElement>(null);
	const hasMarkedAsRead = useRef(value.state === "read");

	const [ref, isIntersecting] = useIntersectionObserver({
		threshold: 1,
		initialIsIntersecting: false,
	});

	useEffect(() => {
		if (messageRef.current) {
			ref(messageRef.current);
		}
	}, [ref]);

	useEffect(() => {
		if (isIntersecting && !hasMarkedAsRead.current) {
			sendMessage({
				type: "message_read",
				payload: {
					id: value.id,
					authorId: value.authorId,
				},
			});
		}
	}, [isIntersecting, sendMessage, value.id, value.authorId]);

	return (
		<div
			ref={messageRef}
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

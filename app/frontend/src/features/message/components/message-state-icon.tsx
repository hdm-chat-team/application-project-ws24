import type { Message } from "@server/db/messages";
import { Check, CheckCheck, ClockArrowUp } from "lucide-react";

export function MessageStateIcon({ state }: { state: Message["state"] }) {
	return (
		<div className="mt-1 flex items-center justify-end gap-1">
			<span className="text-xs drop-shadow">
				{state === "read" ? (
					<CheckCheck className="size-4 text-sky-500 dark:text-sky-300" />
				) : state === "delivered" ? (
					<CheckCheck className="size-4" />
				) : state === "sent" ? (
					<Check className="size-4" />
				) : (
					<ClockArrowUp className="size-4" />
				)}
			</span>
		</div>
	);
}

import { useSocket } from "@/context/socket-provider";
import { useChat } from "@/features/chat/context";
import { messageStateByIdQueryFn } from "@/features/message/queries";
import type { Message } from "@server/db/messages";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { useIntersectionObserver } from "usehooks-ts";
import { usePostMessage } from "./use-mutations";

type UseMessageStateProps = Pick<Message, "id" | "authorId">;

export function useMessageState({ id, authorId }: UseMessageStateProps) {
	const { chat } = useChat();
	if (!chat?.id) throw new Error("Chat not found");
	const isSending = usePostMessage(chat.id).isPending;
	const { sendMessage } = useSocket();
	const messageState = useLiveQuery(() => messageStateByIdQueryFn(id), [id]);

	const [ref, isIntersecting] = useIntersectionObserver({
		threshold: 1,
		initialIsIntersecting: false,
	});

	useEffect(() => {
		if (isIntersecting && messageState === "delivered" && !isSending) {
			sendMessage({
				type: "message:read",
				payload: { id, authorId },
			});
		}
	}, [isIntersecting, messageState, isSending, id, authorId, sendMessage]);

	return ref;
}

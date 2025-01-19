import { messageStateByIdQueryFn } from "@/features/message/queries";
import { useIntersectionObserver, useSocket } from "@/hooks";
import type { Message } from "@server/db/messages";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";

type UseMessageStateProps = Pick<Message, "id" | "authorId">;

export function useMessageState({ id, authorId }: UseMessageStateProps) {
	const { sendMessage } = useSocket();
	const messageState = useLiveQuery(() => messageStateByIdQueryFn(id), [id]);

	const [ref, isIntersecting] = useIntersectionObserver({
		threshold: 1,
		initialIsIntersecting: false,
	});

	useEffect(() => {
		if (isIntersecting && messageState !== "read") {
			sendMessage({
				type: "message_read",
				payload: { id, authorId },
			});
		}
	}, [isIntersecting, sendMessage, id, authorId, messageState]);

	return ref;
}

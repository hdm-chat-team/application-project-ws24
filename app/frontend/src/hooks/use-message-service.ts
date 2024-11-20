import { MessageService } from "@/lib/message-service";
import { useCallback } from "react";

// * Create a custom hook to encapsulate the access to the MessageService
export const useMessageService = () => {
	const messageService = MessageService.getInstance();

	const addMessage = useCallback(
		async (content: string) => {
			await messageService.addSentMessage(content);
		},
		[messageService],
	);

	const addReceivedMessage = useCallback(
		async (content: string) => {
			await messageService.addReceivedMessage(content);
		},
		[messageService],
	);

	return { addMessage, addReceivedMessage };
};

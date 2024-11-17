import { useCallback } from "react";
import { MessageService } from "../message-service";

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

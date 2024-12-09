import { useCallback } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { MessageService } from "@/lib/message-service";

// * Hook to use the message service

export const useMessageService = () => {
	const user = useAuthContext();
	const messageService = MessageService.getInstance();

	const addMessage = useCallback(
		async (content: string) => {
			if (!user) {
				throw new Error("Please login to send messages.");
			}
			try {
				await messageService.addSentMessage(content);
			} catch (error) {
				console.error("Error sending message:", error);
				throw error;
			}
		},
		[messageService, user],
	);

	const addReceivedMessage = useCallback(
		async (content: string) => {
			if (!user) {
				throw new Error("Please login to receive messages.");
			}
			try {
				await messageService.addReceivedMessage(content);
			} catch (error) {
				console.error("Error receiving message:", error);
				throw error;
			}
		},
		[messageService, user],
	);

	return { addMessage, addReceivedMessage };
};
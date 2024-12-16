import { useUser } from "@/features/auth";
import { MessageService } from "@/features/chat/message-service";
import { useCallback } from "react";

// * Hook to use the message service

export const useMessageService = () => {
	const { user } = useUser();
	const messageService = MessageService.getInstance();

	const addMessage = useCallback(
		async (content: string) => {
			if (!user) {
				throw new Error("Please login to send messages.");
			}
			try {
				await messageService.addSentMessage(content, user.id);
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
				await messageService.addReceivedMessage(content, user.id);
			} catch (error) {
				console.error("Error receiving message:", error);
				throw error;
			}
		},
		[messageService, user],
	);

	return { addMessage, addReceivedMessage };
};

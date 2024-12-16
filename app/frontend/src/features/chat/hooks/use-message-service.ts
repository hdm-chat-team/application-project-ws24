import { useUser } from "@/features/auth";
import { MessageService } from "@/features/chat/message-service";
import api from "@/lib/api.ts";
import { useCallback, useEffect, useRef } from "react";

// * Hook to use the message service

export const useMessageService = () => {
	const { user } = useUser();
	const messageService = MessageService.getInstance();
	let keyPair: CryptoKeyPair | null = null;
	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		console.log("useMessageService");
		const socket = api.chat.$ws();
		socketRef.current = socket;
		const asyncData = async () => {
			if (!keyPair) {
				keyPair = await messageService.generateKeyPair();
				const exported = await window.crypto.subtle.exportKey(
					"jwk",
					keyPair.publicKey,
				);
				console.log(exported);
				socketRef?.current?.send(
					JSON.stringify({
						type: "register",
						username: user?.username,
						publicKey: exported,
					}),
				);
			}
		};
		socket.onopen = () => {
			asyncData();
			console.log("Socket is open");
		};
	}, [messageService, keyPair, user]);
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

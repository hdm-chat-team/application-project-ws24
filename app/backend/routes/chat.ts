import { createBunWebSocket } from "hono/bun";
import { createRouter } from "#lib/factory";
import type { ChatSocket } from "#lib/types";

const { upgradeWebSocket } = createBunWebSocket<ChatSocket>();

const topic = "chat";
const users = new Map(); // In-memory storage for users and their public keys
const activeConnections = new Map(); // Store active WebSocket connections

type WebSocketMessage = {
	type: "register" | "key-exchange" | "message";
	message: string;
	recipient: string;
	publicKey: string;
	encryptedMessage: string;
	username: string;
};

export const chatRouter = createRouter().get(
	"/",
	upgradeWebSocket((c) => {
		return {
			onOpen: (_, ws) => {
				const clientId = c.get("requestId");
				const rawWs = ws.raw;
				if (rawWs) {
					rawWs.data.user = clientId;
					const message = `${rawWs.data.user} joined the chat`;
					rawWs.subscribe(topic);
					rawWs.publish(topic, message);
				}
			},
			onMessage: (event, ws) => {
				const rawWs = ws.raw;
				if (rawWs) {
					try {
						const data: WebSocketMessage = JSON.parse(event.data);
						let username = "";
						console.dir(data.publicKey);
						switch (data.type) {
							case "register":
								// Register user and associate WebSocket
								username = data.username;
								activeConnections.set(username, ws);
								users.set(username, data.publicKey);
								ws.send(
									JSON.stringify({
										type: "registered",
										message: "User registered",
									}),
								);
								break;

							case "key-exchange": {
								// Send recipient's public key
								const recipientKey = users.get(data.recipient);
								if (recipientKey) {
									ws.send(
										JSON.stringify({
											type: "key-exchange",
											recipient: data.recipient,
											publicKey: recipientKey,
										}),
									);
								} else {
									ws.send(
										JSON.stringify({
											type: "error",
											message: "Recipient not found",
										}),
									);
								}
								break;
							}

							case "message": {
								// Forward encrypted message to recipient
								const recipientWs = activeConnections.get(data.recipient);
								if (recipientWs) {
									recipientWs.send(
										JSON.stringify({
											type: "message",
											sender: username,
											encryptedMessage: data.encryptedMessage,
										}),
									);
								} else {
									ws.send(
										JSON.stringify({
											type: "error",
											message: "Recipient not connected",
										}),
									);
								}
								break;
							}

							default:
								ws.send(
									JSON.stringify({
										type: "error",
										message: "Invalid message type",
									}),
								);
						}
					} catch (error) {
						ws.send(
							JSON.stringify({
								type: "error",
								message: "Invalid message format",
							}),
						);
					}
					const message = `${rawWs.data.user}: ${event.data}`;
					rawWs.send(message);
					rawWs.publish(topic, message);
				}
			},
			onClose: (_, ws) => {
				const rawWs = ws.raw;
				if (rawWs) {
					const message = `${rawWs.data.user} left the chat`;
					rawWs.publish(topic, message);
				}
			},
		};
	}),
);

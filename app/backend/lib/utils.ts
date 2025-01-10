import type { Server, ServerWebSocket, ServerWebSocketSendStatus } from "bun";
import { type WSEventData, wsEventDataSchema } from "#shared/types";

let serverInstance: Server;

export function setServer(server: Server) {
	serverInstance = server;
}

export function getServer() {
	if (!serverInstance) {
		throw new Error("Server not initialized");
	}
	return serverInstance;
}

/**
 * Sends a message to subscribers of the topic.
 * @param topic The topic name.
 * @param data The data to be sent. It must conform to WSEventData schema
 * @param socket Optional WebSocket server or socket instance. Defaults to global server instance
 * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
 * @throws ZodError if data doesn't match WSEventData schema
 */
export function publish(
	topic: string,
	data: WSEventData,
	compress?: boolean,
	socket: ServerWebSocket | Server = getServer(),
) {
	wsEventDataSchema.parse(data);
	return socket.publish(
		topic,
		JSON.stringify(data),
		compress,
	) as ServerWebSocketSendStatus;
}

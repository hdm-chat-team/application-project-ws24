import type { Server, ServerWebSocket, ServerWebSocketSendStatus } from "bun";
import type { WSContext } from "hono/ws";
import {
	type ServerToClientWsEventData,
	serverToClientWsEventData,
} from "#shared/types";

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
 * @param data The data to be sent. It must conform to WSEventData schema.
 * @param socket Optional WebSocket server or socket instance. Defaults to global server instance
 * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
 * @returns {ServerWebSocketSendStatus} The status of the send operation.
 * @throws ZodError if data doesn't match WSEventData schema
 */
export function publish(
	topic: string,
	data: ServerToClientWsEventData,
	compress?: boolean,
	socket: ServerWebSocket | Server = getServer(),
): ServerWebSocketSendStatus {
	serverToClientWsEventData.parse(data);
	return socket.publish(topic, JSON.stringify(data), compress);
}

/**
 * Sends data over a WebSocket connection
 * @param socket - The WebSocket connection to send data through. (either Bun or Hono WebSocket)
 * @param data - The data to be sent. It must conform to WSEventData schema.
 * @param compress - Should the data be compressed? If the client does not support compression, this is ignored.
 * @throws {ZodError} When the data fails schema validation
 */
export function send(
	socket: ServerWebSocket | WSContext,
	data: ServerToClientWsEventData,
	compress?: boolean,
) {
	serverToClientWsEventData.parse(data);
	return socket.send(JSON.stringify(data), compress);
}

import { Temporal } from "@js-temporal/polyfill";
import type { Server, ServerWebSocket, ServerWebSocketSendStatus } from "bun";
import type { WSContext } from "hono/ws";
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
 * @param data The data to be sent. It must conform to WSEventData schema.
 * @param socket Optional WebSocket server or socket instance. Defaults to global server instance
 * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
 * @returns {ServerWebSocketSendStatus} The status of the send operation.
 * @throws ZodError if data doesn't match WSEventData schema
 */
export function publish(
	topic: string,
	data: WSEventData,
	compress?: boolean,
	socket: ServerWebSocket | Server = getServer(),
): ServerWebSocketSendStatus {
	wsEventDataSchema.parse(data);
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
	data: WSEventData,
	compress?: boolean,
) {
	wsEventDataSchema.parse(data);
	return socket.send(JSON.stringify(data), compress);
}

/**
 * Formats the current time in Berlin timezone to a string in the format "HH:mm"
 * @returns {string} The formatted time string
 */
export function formatBerlinTime() {
	return Temporal.Now.zonedDateTimeISO("Europe/Berlin").toLocaleString(
		"de-DE",
		{
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		},
	);
}

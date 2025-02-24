import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { createId } from "@application-project-ws24/cuid";
import WebSocketService from "./ws-service";

describe("WebSocketService", () => {
	let ws: WebSocketService;
	let mockCallback: (event: MessageEvent) => void;

	beforeEach(() => {
		mockCallback = mock((_event: MessageEvent) => {});
		ws = new WebSocketService("ws://test.com", mockCallback);
	});

	test("should initialize and connect", () => {
		expect(ws).toBeDefined();

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const socket = (ws as any).socket;
		expect(socket).toBeDefined();
	});

	test.todo("should send valid messages", async () => {
		const validMessage = {
			type: "message:incoming" as const,
			payload: {
				id: createId(),
				authorId: createId(),
				chatId: createId(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				state: "pending" as const,
				body: "Test message",
			},
		};

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const socket = (ws as any).socket;
		const sendSpy = spyOn(socket, "send");

		// Set readyState through property descriptor
		Object.defineProperty(socket, "readyState", { value: WebSocket.OPEN });
		ws.sendMessage(validMessage);

		expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(validMessage));
	});

	test.todo("should handle connection errors", async () => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const socket = (ws as any).socket;
		const consoleSpy = spyOn(console, "error");
		const rejectPromise = new Promise((_, reject) => {
			socket.onerror?.(new ErrorEvent("error", { message: "Test error" }));
			reject(new Error("WebSocket connection failed: Test error"));
		});

		expect(rejectPromise).rejects.toThrow(
			"WebSocket connection failed: Test error",
		);
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	test("should attempt reconnection on close", () => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const reconnectSpy = spyOn(ws as any, "reconnect");
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const socket = (ws as any).socket;

		socket.onclose?.(new CloseEvent("close"));
		expect(reconnectSpy).toHaveBeenCalled();
	});

	test("should cleanup on disconnect", () => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const socket = (ws as any).socket;
		const closeSpy = spyOn(socket, "close");

		ws.disconnect();

		expect(closeSpy).toHaveBeenCalled();
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		expect((ws as any).socket).toBeNull();
	});

	test("should validate messages before sending", () => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const socket = (ws as any).socket;
		const sendSpy = spyOn(socket, "send");
		const invalidMessage = { type: "invalid" };

		// Set readyState through property descriptor
		Object.defineProperty(socket, "readyState", { value: WebSocket.OPEN });
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		ws.sendMessage(invalidMessage as any);

		expect(sendSpy).not.toHaveBeenCalled();
	});
});

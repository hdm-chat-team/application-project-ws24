import { expect, test } from "bun:test";
import type { Server } from "bun";
import { getServer, setServer } from "./utils";

test("server management", () => {
	const mockServer = {
		port: 3000,
		hostname: "localhost",
		stop: () => Promise.resolve(),
		reload: () => Promise.resolve(),
		upgrade: () => {},
		publish: () => {},
		pendingWebSockets: 0,
		development: false,
	} as unknown as Server;

	// Should set server without throwing
	expect(() => setServer(mockServer)).not.toThrow();

	// Should retrieve the same server instance
	expect(getServer()).toBe(mockServer);
});

test("getServer throws when not initialized", () => {
	// Reset module state
	setServer(undefined as unknown as Server);

	// Should throw when server is not initialized
	expect(() => getServer()).toThrow("Server not initialized");
});

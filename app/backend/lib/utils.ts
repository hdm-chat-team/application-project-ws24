import type { Server } from "bun";

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

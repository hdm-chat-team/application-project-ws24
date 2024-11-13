import type { ServerWebSocket } from "bun";

export type ChatSocket = ServerWebSocket<{ user: string }>;

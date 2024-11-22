import type { ServerWebSocket } from "bun";
import type { Env } from "hono";
import type { Session, User } from "#db/schema.sql";

export type ChatSocket = ServerWebSocket<{ user: string }>;

export interface Context extends Env {
	Variables: {
		user: User | null;
		session: Session | null;
	};
}

export interface GitHubUser {
	id: string;
	login: string;
}

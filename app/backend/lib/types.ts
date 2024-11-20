import type { Session, User } from "@application-project-ws24/database/schema";
import type { ServerWebSocket } from "bun";
import type { Env } from "hono";

export type ChatSocket = ServerWebSocket<{ user: string }>;

export interface Context extends Env {
	Variables: {
		user: User | null;
		session: Session | null;
	};
}

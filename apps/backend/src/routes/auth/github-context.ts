import type { Session, User } from "@application-project-ws24/database/schema";
import type { Env } from "hono";

export interface Context extends Env {
	Variables: {
		user: User | null;
		session: Session | null;
	};
}

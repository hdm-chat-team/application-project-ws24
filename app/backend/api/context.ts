import type { Env } from "hono";
import type { Session } from "#db/sessions";
import type { User } from "#db/users";

export interface Context extends Env {
	Variables: {
		user: User | null;
		session: Session | null;
	};
}

export interface ProtectedContext extends Env {
	Variables: {
		user: User;
		session: Session;
	};
}

import type { Session, User } from "@application-project-ws24/database/schema";

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

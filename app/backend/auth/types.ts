import type { Session, User } from "#db/schema.sql";

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

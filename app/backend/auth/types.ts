import type { Session, User } from "#db/schema.sql";

export type SessionValidationResult =
	| { session: Session; user: User; fresh: boolean }
	| { session: null; user: null; fresh: boolean };

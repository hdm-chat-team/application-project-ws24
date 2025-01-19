import type { Env as E } from "hono";
import type { Session } from "#db/sessions";
import type { User, UserProfile } from "#db/users";

export type Env = E & {
	Variables: {
		user: User | null;
		profile: UserProfile | null;
		session: Session | null;
	};
};

export type ProtectedEnv = E & {
	Variables: {
		user: User;
		profile: UserProfile;
		session: Session;
	};
};

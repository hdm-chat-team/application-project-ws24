import type { Env as HonoEnv } from "hono";
import type { Session } from "#db/sessions";
import type { User } from "#db/users";

export interface Env extends HonoEnv {
	Variables: {
		user: User | null;
		session: Session | null;
	};
}

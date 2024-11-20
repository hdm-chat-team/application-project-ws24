import { validateSessionToken } from "@application-project-ws24/auth/session";
import type { Session } from "@application-project-ws24/database/schema";
import type { Next } from "hono";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/dist/types/helper/factory";
import { HTTPException } from "hono/http-exception";
import type { Context } from "../../lib/types.ts";

export const authMiddleware = createMiddleware(
	async (c: Context, next: Next) => {
		const sessionId =
			(JSON.parse(getCookie(c, "session") || "") as Session) ?? null;
		if (!sessionId) {
			throw new HTTPException(401, { message: "No session id" });
		}

		const { session } = await validateSessionToken(sessionId.id);
		if (!session) {
			throw new HTTPException(401, { message: "Not authenticated" });
		}
		return next();
	},
);

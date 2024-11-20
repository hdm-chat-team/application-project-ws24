import { validateSessionToken } from "@application-project-ws24/auth/session";
import type { Session } from "@application-project-ws24/database/schema";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const authMiddleware = createMiddleware(async (c, next) => {
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
});

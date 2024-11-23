import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { validateSessionToken } from "#auth/session";

const cookieConfig = {
	path: "/",
	secure: process.env.NODE_ENV !== "development",
	httpOnly: process.env.NODE_ENV !== "development",
	sameSite: "lax" as const,
	domain: process.env.NODE_ENV === "development" ? "localhost" : ".example.com",
};

export const authMiddleware = createMiddleware(async (c, next) => {
	const sessionId = getCookie(c, "auth_session") ?? null;
	console.log("sessionId", sessionId);
	if (!sessionId) {
		c.set("user", null);
		c.set("session", null);
		return next();
	}
	const { session, user, fresh } = await validateSessionToken(sessionId);

	if (session && fresh) {
		setCookie(c, "auth_session", session.id, {
			...cookieConfig,
			expires: session.expiresAt,
		});
	}
	if (!session) {
		deleteCookie(c, "auth_session");
	}

	c.set("user", user);
	c.set("session", session);
	return next();
});

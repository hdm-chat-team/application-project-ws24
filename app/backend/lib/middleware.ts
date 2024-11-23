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

/**
 * Middleware to handle authentication by validating session tokens.
 *
 * This middleware checks for the presence of an "auth_session" cookie.
 * If the cookie is not found, it sets the user and session context to null and proceeds to the next middleware.
 * If the cookie is found, it validates the session token.
 *
 * - If the session is valid and fresh, it updates the "auth_session" cookie with the new session ID and expiration date.
 * - If the session is invalid, it deletes the "auth_session" cookie.
 *
 * The middleware sets the user and session context based on the validation result and proceeds to the next middleware.
 *
 * @param {Context} c - The context object representing the request and response.
 * @param {Function} next - The next middleware function in the stack.
 *
 * @returns {Promise<void>} A promise that resolves when the middleware is complete.
 */
export const authMiddleware = createMiddleware<Env>(async (c, next) => {
	const sessionId = getCookie(c, "auth_session") ?? null;
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

import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { validateSessionToken } from "#auth/session";
import type { Env } from "./types";

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

/**
 * Middleware to protect routes by ensuring that both session and user are present in the context.
 * If either session or user is missing, it throws an HTTP 401 Unauthorized exception.
 *
 * @param c - The context object containing the session and user.
 * @param next - The next middleware function to call if the session and user are present.
 * @throws {HTTPException} - Throws a 401 Unauthorized exception if the session or user is not present.
 *
 * @example
 * .get("/protected", protectedRoute, async (c) => { ... })
 */
export const protectedRoute = createMiddleware<Env>(async (c, next) => {
	const session = c.get("session");
	const user = c.get("user");

	if (!(session && user)) throw new HTTPException(401);
	return next();
});

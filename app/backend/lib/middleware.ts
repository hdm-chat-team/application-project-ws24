import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/bun";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { HTTPResponseError } from "hono/types";
import { validateSessionToken } from "#auth/session";
import type { Session, User } from "#db/schema.sql";
import cookieConfig from "#lib/cookie";
import type { Env } from "./types";

/**
 * Middleware to handle authentication state by validating session tokens.
 *
 * @param {Context<Env>} c - The Hono context object
 * @param {Function} next - The next middleware function
 * @returns {Promise<void>} Promise that resolves after authentication check
 *
 * @description
 * Checks for "auth_session" cookie and validates the session:
 * - No cookie: Sets user and session to null
 * - Valid cookie & fresh session: Updates cookie with new expiration
 * - Invalid cookie: Deletes the cookie
 *
 * Sets the following context variables:
 * - user: User object or null
 * - session: Session object or null
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
 * Middleware to protect routes by requiring a valid user and session.
 *
 * @description
 * Sets the following context variables when successful:
 * - authenticatedUser: Verified User object
 * - authenticatedSession: Verified Session object
 *
 * @throws {HTTPException} 401 error if user or session is missing
 *
 * @example
 * router.get("/protected", protectedRoute, async (c) => {
 *   const user = c.get("authenticatedUser");
 *   // Handle protected route...
 * });
 */
export const protectedRoute = createMiddleware<
	Env & {
		Variables: { authenticatedUser: User; authenticatedSession: Session };
	}
>(async (c, next) => {
	const session = c.get("session");
	const user = c.get("user");

	if (!(session && user)) throw new HTTPException(401);

	c.set("authenticatedUser", user);
	c.set("authenticatedSession", session);
	return next();
});

/**
 * Middleware for rate limiting requests.
 *
 * This middleware uses a rate limiter to restrict the number of requests
 * that can be made within a specified time window.
 *
 */
export const limiter = rateLimiter({
	windowMs: 10 * 1000,
	limit: 10,
	standardHeaders: "draft-6",
	keyGenerator: (c) => {
		return getConnInfo(c).remote.address ?? "default-key";
	},
});

/**
 * Handles errors by logging them and returning an appropriate HTTP response.
 *
 * @param error - The error to handle, which can be an instance of `Error` or `HTTPResponseError`.
 * @returns A `Response` object with a status code and message based on the error type.
 */
export async function onError(error: Error | HTTPResponseError) {
	console.error(error);
	return !(error instanceof HTTPException)
		? new Response(error.message, {
				status: 500,
				statusText: `Internal error: ${error.cause}`,
			})
		: error.getResponse();
}

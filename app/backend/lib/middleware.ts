import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/bun";
import { every } from "hono/combine";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { HTTPResponseError } from "hono/types";
import { validateSessionToken } from "#auth/session";
import type { User } from "#db/schema/user.sql";
import type { Session } from "#db/schema/session.sql";
import env, { DEV, TEST } from "#env";
import cookieConfig from "#lib/cookie";
import type { Env } from "./types";

const origin = DEV
	? ["http://localhost:5173", `http://localhost:${env.PORT}`]
	: [`http://localhost:${env.PORT}`];

/**
 * Middleware for rate limiting requests.
 *
 * This middleware uses a rate limiter to restrict the number of requests
 * that can be made within a specified time window.
 *
 */
const limiter = rateLimiter({
	windowMs: 10 * 1000,
	limit: 10,
	keyGenerator: (c) => {
		try {
			const connInfo = getConnInfo(c);
			return connInfo?.remote.address || "unknown";
		} catch {
			return "unknown";
		}
	},
});

/**
 * Middleware to handle authentication state by validating session tokens.
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
const authMiddleware = createMiddleware<Env>(async (c, next) => {
	const sessionId = getCookie(c, "auth_session") ?? null;
	if (!sessionId) {
		c.set("user", null);
		c.set("session", null);
		return next();
	}
	const { session, user, fresh } = await validateSessionToken(sessionId);

	if (session && fresh) {
		setCookie(c, "auth_session", session.token, {
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
 * Route protection middleware.
 *
 * @description
 * makes sure that a valid session and user are present in the context, making them not be null.
 *
 * @throws {HTTPException} 401 error if user or session is missing
 *
 * @example
 * router.get("/protected", protectedRoute, async (c) => {
 *   const user = c.get("user");
 *   const session = c.get("session");
 *   // Handle protected route...
 * });
 */
export const protectedRoute = createMiddleware<
	Env & {
		Variables: { user: User; session: Session };
	}
>(async (c, next) => {
	const session = c.get("session");
	const user = c.get("user");

	if (!session || !user)
		throw new HTTPException(401, {
			message: "Unauthorized",
			cause: "Missing session or user",
		});

	c.set("user", user);
	c.set("session", session);
	return next();
});

/**
 * Combines multiple middleware functions into a single middleware.
 *
 * @description
 * This middleware includes:
 * - `cors()`:			Cross-Origin Resource Sharing.
 * - `csrf()`: 			Cross-Site Request Forgery protection.
 * - `authMiddleware`: 	to sync app and database auth sessions.
 * - `limiter`: 		Rate limiter.
 */
export const securityMiddlewares = every(
	cors({
		origin,
		credentials: true,
		maxAge: DEV ? undefined : 3600,
	}),
	csrf({ origin }),
	authMiddleware,
	limiter,
);

/**
 * Combines multiple middleware functions into a single middleware.
 *
 * @description
 * This middleware includes:
 * - `logger()`: 		Logs request and response details.
 * - `prettyJSON()`: 	Formats JSON responses to be more readable.
 */
export const utilityMiddlewares = every(
	...(!TEST ? [logger(), prettyJSON()] : []),
);

/**
 * Handles errors by logging them and returning an appropriate HTTP response.
 *
 * @param error - The error to handle, which can be an instance of `Error` or `HTTPResponseError`.
 * @returns A `Response` object with a status code and message based on the error type.
 */
export async function onError(error: Error | HTTPResponseError) {
	let response: Response;
	if (!(error instanceof HTTPException)) {
		console.error(error);
		response = new Response(error.message, {
			status: 500,
			statusText: `Internal error: ${error.cause}`,
		});
	} else {
		response = error.getResponse();
	}
	return response;
}

import { every } from "hono/combine";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { HTTPResponseError } from "hono/types";
import type { Env, ProtectedEnv } from "#api/app.env";
import { validateSessionToken } from "#auth/session";
import env, { DEV, TEST } from "#env";
import cookieConfig from "#lib/cookie";

const SESSION_COOKIE_NAME = "auth_session";

const origin = DEV
	? [env.APP_URL, `http://localhost:${env.PORT}`, "http://localhost:5173"]
	: [env.APP_URL];

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
	const sessionCookieToken = getCookie(c, SESSION_COOKIE_NAME) ?? null;

	if (!sessionCookieToken) {
		c.set("user", null);
		c.set("session", null);
		c.set("profile", null);
		return next();
	}

	const { session, user, profile, fresh } =
		await validateSessionToken(sessionCookieToken);

	if (!session) {
		deleteCookie(c, SESSION_COOKIE_NAME);
	} else if (fresh) {
		setCookie(c, SESSION_COOKIE_NAME, session.token, {
			...cookieConfig,
			expires: session.expiresAt,
		});
	}

	c.set("user", user);
	c.set("profile", profile);
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
export const protectedRoute = createMiddleware<ProtectedEnv>(
	async (c, next) => {
		const { session, user, profile } = c.var;

		return !(session && user && profile)
			? c.json({ message: "Unauthorized" }, 401)
			: next();
	},
);

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
		credentials: DEV,
		maxAge: DEV ? undefined : 3600,
	}),
	csrf({ origin }),
	authMiddleware,
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
	console.error(error);
	return !(error instanceof HTTPException)
		? new Response(error.message, {
				status: 500,
				statusText: `Internal error: ${error.cause}`,
			})
		: error.getResponse();
}

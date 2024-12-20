import { zValidator } from "@hono/zod-validator";
import { invalidateSession } from "#auth/session";
import { createRouter } from "#api/factory";
import { protectedRoute } from "#lib/middleware";
import { githubRouter } from "./github";
import { signoutQuerySchema } from "./index.schemas";
import { deleteCookie } from "hono/cookie";

const REDIRECT_URL = "http://localhost:5173";

export const authRouter = createRouter()
	.route("/github", githubRouter)
	.get("/", protectedRoute, async (c) => {
		const user = c.get("user");
		return c.json(user);
	})
	.get(
		"/signout",
		protectedRoute,
		zValidator("query", signoutQuerySchema),
		async (c) => {
			const { token } = c.get("session");
			const { from } = c.req.valid("query");

			await invalidateSession(token);
			deleteCookie(c, "auth_session");
			return c.redirect(from ?? REDIRECT_URL);
		},
	);

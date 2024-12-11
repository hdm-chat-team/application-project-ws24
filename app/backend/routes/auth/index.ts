import { zValidator } from "@hono/zod-validator";
import { invalidateSession } from "#auth/session";
import { createRouter } from "#lib/factory";
import { protectedRoute } from "#lib/middleware";
import { githubRouter } from "./github";
import { signoutQuerySchema } from "./index.schemas";

const REDIRECT_URL = "http://localhost:5173";

export const authRouter = createRouter()
	.route("/github", githubRouter)
	.get(
		"/signout",
		protectedRoute,
		zValidator("query", signoutQuerySchema),
		async (c) => {
			const { id } = c.get("session");
			const { from } = c.req.valid("query");
			await invalidateSession(id);
			return c.redirect(from || REDIRECT_URL);
		},
	)
	.get("/", protectedRoute, async (c) => {
		const user = c.get("user");
		return c.json(user);
	});

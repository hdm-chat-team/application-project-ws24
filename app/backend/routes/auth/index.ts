import { invalidateSession } from "#auth/session";
import { createRouter } from "#lib/factory";
import { protectedRoute } from "#lib/middleware";
import { githubRouter } from "./github";

const REDIRECT_URL = "http://localhost:5173";

export const authRouter = createRouter()
	.route("/github", githubRouter)
	.get("/signout", protectedRoute, async (c) => {
		const { id } = c.get("session");
		await invalidateSession(id);
		return c.redirect(REDIRECT_URL);
	})
	.get("/user", protectedRoute, async (c) => {
		const user = c.get("user");

		return c.json({ user });
	});

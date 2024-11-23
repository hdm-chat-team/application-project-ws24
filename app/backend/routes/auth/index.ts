import { invalidateSession } from "#auth/session";
import { createRouter } from "#lib/factory";
import { protectedRoute } from "#lib/middleware";
import { githubRouter } from "./github";

export const authRouter = createRouter()
	.route("/github", githubRouter)
	.get("/signout", protectedRoute, async (c) => {
		const { id } = c.get("authenticatedSession");
		await invalidateSession(id);
		return c.redirect("/");
	});

import { invalidateSession } from "#auth/session";
import { createRouter } from "#lib/factory";
import { githubRouter } from "./github";

export const authRouter = createRouter()
	.route("/github", githubRouter)
	.get("/signout", async (c) => {
		const session = c.get("session");
		if (!session) {
			return c.body(null, 401);
		}
		await invalidateSession(session.id);
		return c.redirect("/");
	});

import { invalidateSession } from "@application-project-ws24/auth/session";
import { Hono } from "hono";
import type { Context } from "../../lib/types.ts";

export const githubLogoutRouter = new Hono<Context>();

githubLogoutRouter.post("/github", async (c) => {
	const session = c.get("session");
	if (!session) {
		return c.body(null, 401);
	}
	await invalidateSession(session.id);
	return c.redirect("/login");
});

import { invalidateSession } from "#auth/session";
import { createRouter } from "#lib/factory";
import { protectedRoute } from "#lib/middleware";
import type { Context } from "hono";
import { githubRouter } from "./github";

export const authRouter = createRouter()
	.route("/github", githubRouter)
	.get("/signout", protectedRoute, async (c) => {
		const { id } = c.get("authenticatedSession");
		await invalidateSession(id);
		return c.redirect("/");
	})

    .get("/me", protectedRoute, async (c: Context) => {
        const user = c.get("user");
        
        if (!user) {
            return c.json(null);
        }

        return c.json({
            id: user.id,
            username: user.username,
            githubId: user.githubId
        });
    });
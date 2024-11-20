import { github } from "@application-project-ws24/auth/github";
import {
	createSession,
	generateSessionToken,
	invalidateSession,
} from "@application-project-ws24/auth/session";
import db from "@application-project-ws24/database";
import { userTable } from "@application-project-ws24/database/schema";
import { OAuth2RequestError, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { createRouter } from "#lib/factory";
import type { GitHubUser } from "#lib/types";

export const githubRouter = createRouter()
	.get("/", async (c) => {
		const state = generateState();
		const url = github.createAuthorizationURL(state, ["user"]);
		setCookie(c, "github_oauth_state", state, {
			path: "/",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: "Lax",
		});
		return c.redirect(url.toString());
	})
	.post("/", async (c) => {
		const session = c.get("session");
		if (!session) {
			return c.body(null, 401);
		}
		await invalidateSession(session.id);
		return c.redirect("/login");
	})
	.get("/callback", async (c) => {
		const code = c.req.query("code")?.toString() ?? null;
		const state = c.req.query("state")?.toString() ?? null;

		const { github_oauth_state } = getCookie(c);
		const storedState = github_oauth_state ?? null;

		if (!code || !state || !storedState || state !== storedState) {
			return c.body(null, 400);
		}
		try {
			const tokens = await github.validateAuthorizationCode(code);
			const githubUserResponse = await fetch("https://api.github.com/user", {
				headers: {
					Authorization: `Bearer ${tokens.accessToken()}`,
				},
			});

			const githubUser = (await githubUserResponse.json()) as GitHubUser;
			const existingUser = await db.query.userTable.findFirst({
				where: eq(userTable.githubId, githubUser.id),
			});

			const sessionId = generateSessionToken();
			if (existingUser) {
				const session = await createSession(sessionId, existingUser.id);
				session.id = sessionId;
				setCookie(c, "session", JSON.stringify(session));
				return c.redirect("/");
			}

			await db.insert(userTable).values({
				githubId: githubUser.id,
				username: githubUser.login,
			});

			const session = await createSession(sessionId, githubUser.id);
			session.id = sessionId;
			setCookie(c, "session", JSON.stringify(session));
			return c.redirect("/");
		} catch (error) {
			if (
				error instanceof OAuth2RequestError &&
				error.message === "bad_verification_code"
			) {
				// invalid code
				return c.body(null, 400);
			}
			return c.body(null, 500);
		}
	});

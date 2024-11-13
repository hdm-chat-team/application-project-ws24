import { OAuth2RequestError, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { github } from "./github-provider.ts";

import {
	createSession,
	generateSessionToken,
} from "@application-project-ws24/auth";
import db from "@application-project-ws24/database";
import { userTable } from "@application-project-ws24/database/schema";
import type { Context } from "./github-context.ts";

export const githubLoginRouter = new Hono<Context>();

githubLoginRouter.get("/login/github", async (c) => {
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
});

githubLoginRouter.get("/login/github/callback", async (c) => {
	const code = c.req.query("code")?.toString() ?? null;
	const state = c.req.query("state")?.toString() ?? null;
	// @ts-ignore
	const storedState = getCookie(c).github_oauth_state ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		return c.body(null, 400);
	}
	try {
		const tokens = await github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		});
		const githubUser: GitHubUser =
			(await githubUserResponse.json()) as GitHubUser;
		const existingUser = await db
			.select()
			.from(userTable)
			.where(eq(userTable.githubId, githubUser.id));

		const sessionID = generateSessionToken();
		if (existingUser) {
			const session = await createSession(sessionID, existingUser[0].id);
			setCookie(c, sessionID, JSON.stringify(session));
			return c.redirect("/");
		}

		await db.insert(userTable).values({
			githubId: githubUser.id,
			username: githubUser.login,
			email: "HABEN WIR NOCH NICHT VON GITHUB",
			passwordHash:
				"KEINE AHNUNG WARUM DAS HIER STEHEN SOLLTE, DIE NUTZER DATEN STEHEN IN GITHUB, ICH MÖCHTE KEIN PASSWORT HASH IN MEINER DB SPEICHERN!!!",
		});
		const session = await createSession(sessionID, githubUser.id);
		setCookie(c, sessionID, JSON.stringify(session));
		return c.redirect("/");
	} catch (e) {
		if (
			e instanceof OAuth2RequestError &&
			e.message === "bad_verification_code"
		) {
			// invalid code
			return c.body(null, 400);
		}
		return c.body(null, 500);
	}
});

interface GitHubUser {
	id: string;
	login: string;
}

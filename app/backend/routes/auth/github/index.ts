import { OAuth2RequestError, generateState } from "arctic";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { github } from "#auth/github-provider";
import {
	createSession,
	generateSessionToken,
	invalidateSession,
} from "#auth/session";
import { insertUser, selectUserByGithubId } from "#db/queries.sql";
import { createRouter } from "#lib/factory";
import type { GitHubUser } from "#lib/types";

export const githubRouter = createRouter()
	.get("/", async (c) => {
		deleteCookie(c, "github_oauth_state");
		const state = generateState();
		const url = github.createAuthorizationURL(state, ["read:user"]);
		setCookie(c, "github_oauth_state", state, {
			path: "/",
			secure: process.env.NODE_ENV !== "development",
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
		const { code, state } = c.req.query();

		const cookieAuthState = getCookie(c, "github_oauth_state");
		console.log({ code, state, cookieAuthState });

		if (!code || !state || !cookieAuthState || state !== cookieAuthState) {
			throw new HTTPException(400, {
				message: "Invalid GitHub OAuth flow",
				cause: "invalid_oauth_flow",
			});
		}
		try {
			const tokens = await github.validateAuthorizationCode(code);
			const githubUserResponse = await fetch("https://api.github.com/user", {
				headers: {
					Authorization: `Bearer ${tokens.accessToken()}`,
				},
			});

			if (!githubUserResponse.ok) {
				console.error("GitHub API Error:", await githubUserResponse.text());
				throw new HTTPException(500, {
					message: "Failed to fetch GitHub user data",
					cause: "github_api_error",
				});
			}

			const githubUser = (await githubUserResponse.json()) as GitHubUser;
			const existingUser = await selectUserByGithubId
				.execute({
					githubId: githubUser.id,
				})
				.catch((error) => {
					console.error("Database query error:", error);
					throw new HTTPException(500, {
						message: "Database query failed",
						cause: "database_error",
					});
				});

			const sessionId = generateSessionToken();

			if (existingUser) {
				try {
					const session = await createSession(sessionId, existingUser.id);
					setCookie(c, "session", session.id, {
						path: "/",
						secure: process.env.NODE_ENV !== "development",
						httpOnly: true,
						sameSite: "Lax",
						expires: session.expiresAt,
					});
					return c.redirect("http://localhost:5173/");
				} catch (err) {
					console.error("Session creation error:", err);
					throw new HTTPException(500, {
						message: "Failed to create session",
						cause: "session_error",
					});
				}
			}

			try {
				const insertedRows = await insertUser.execute({
					githubId: githubUser.id,
					username: githubUser.login,
				});

				const userId = insertedRows[0].id;
				const session = await createSession(sessionId, userId);
				setCookie(c, "session", session.id, {
					path: "/",
					secure: process.env.NODE_ENV !== "development",
					httpOnly: true,
					sameSite: "Lax",
					expires: session.expiresAt,
				});

				return c.redirect("http://localhost:5173/");
			} catch (err) {
				console.error("User creation error:", err);
				throw new HTTPException(500, {
					message: "Failed to create user",
					cause: "database_error",
				});
			}
		} catch (error) {
			console.error("OAuth flow error:", error);
			if (error instanceof OAuth2RequestError) {
				throw new HTTPException(400, {
					message: "Invalid OAuth request",
					cause: error.message,
				});
			}
			if (error instanceof HTTPException) {
				throw error;
			}
			throw new HTTPException(500, {
				message: "Failed to complete GitHub OAuth flow",
				cause: "unknown_error",
			});
		}
	});

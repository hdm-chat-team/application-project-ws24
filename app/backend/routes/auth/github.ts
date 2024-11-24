import { OAuth2RequestError, generateState } from "arctic";
import type { Context as HonoContext } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { github } from "#auth/oauth";
import { createSession, generateSessionToken } from "#auth/session";
import { insertUser, selectUserByGithubId } from "#db/queries.sql";
import env from "#env";
import { createRouter } from "#lib/factory";
import type { Env, GitHubUser } from "#lib/types";

const OAUTH_API_URL = "https://api.github.com/user";
const REDIRECT_URL = "http://localhost:5173/";

const cookieConfig = {
	path: "/",
	secure: env.NODE_ENV !== "development",
	httpOnly: env.NODE_ENV !== "development",
	sameSite: "lax" as const,
	domain: env.NODE_ENV === "development" ? "localhost" : ".example.com",
};

export const githubRouter = createRouter()
	.get("/", async (c) => {
		const state = generateState();
		const url = github.createAuthorizationURL(state, ["user"]);
		await setOAuthStateCookie(c, state);
		return c.redirect(url.toString());
	})
	.get("/callback", async (c) => {
		const { code, state } = c.req.query();
		const cookieAuthState = getCookie(c, "github_oauth_state");

		if (!code || !state || !cookieAuthState || state !== cookieAuthState) {
			throw new HTTPException(400, {
				message: "Invalid GitHub OAuth flow",
				cause: "invalid_oauth_flow",
			});
		}

		try {
			const tokens = await github.validateAuthorizationCode(code);
			const githubUser = await fetchGitHubUser(tokens.accessToken());
			const user = await handleUserAuthentication(githubUser);
			await createAndSetSessionCookie(c, user.id);

			return c.redirect(REDIRECT_URL);
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

async function setOAuthStateCookie(c: HonoContext<Env>, state: string) {
	const TEN_MINUTES = 60 * 10;
	setCookie(c, "github_oauth_state", state, {
		...cookieConfig,
		maxAge: TEN_MINUTES,
	});
}

async function createAndSetSessionCookie(c: HonoContext<Env>, userId: string) {
	const token = generateSessionToken();
	const session = await createSession(userId, token);
	setCookie(c, "auth_session", token, {
		...cookieConfig,
		expires: session.expiresAt,
	});
}

async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
	const response = await fetch(OAUTH_API_URL, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!response.ok) {
		console.error("GitHub API Error:", await response.text());
		throw new HTTPException(500, {
			message: "Failed to fetch GitHub user data",
			cause: "github_api_error",
		});
	}

	return response.json() as Promise<GitHubUser>;
}

async function handleUserAuthentication(githubUser: GitHubUser) {
	const existingUser = await selectUserByGithubId
		.execute({ githubId: githubUser.id })
		.catch((error) => {
			console.error("Database query error:", error);
			throw new HTTPException(500, {
				message: "Database query failed",
				cause: "database_error",
			});
		});

	if (existingUser) {
		return existingUser;
	}

	return insertUser
		.execute({
			githubId: githubUser.id,
			username: githubUser.login,
		})
		.then((result) => result[0]);
}

import { zValidator } from "@hono/zod-validator";
import { type OAuth2Tokens, generateState } from "arctic";
import type { Context as HonoContext } from "hono";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import type { Env } from "#api/app.env";
import { createRouter } from "#api/factory";
import { type GitHubUser, github } from "#auth/oauth";
import { createSession, generateSessionToken } from "#auth/session";
import db from "#db";
import { insertSelfChat, insertSelfChatMembership } from "#db/chats";
import { insertUserWithProfile } from "#db/users";
import env, { DEV } from "#env";
import cookieConfig from "#lib/cookie";
import {
	callbackCookieSchema,
	callbackQuerySchema,
	githubQuerySchema,
} from "./github.schemas";

const OAUTH_API_URL = "https://api.github.com/user";
const REDIRECT_URL = DEV ? "http://localhost:5173" : env.APP_URL;

const TEN_MINUTES = 60 * 10;

export const githubRouter = createRouter()
	.get("/", zValidator("query", githubQuerySchema), async (c) => {
		const state = generateState();
		const url = github.createAuthorizationURL(state, ["user"]);
		const { from } = c.req.valid("query");

		setCookie(c, "github_oauth_state", state, {
			...cookieConfig,
			maxAge: TEN_MINUTES,
		});
		if (from) {
			setCookie(c, "oauth_redirect_to", from, {
				...cookieConfig,
				maxAge: TEN_MINUTES,
			});
		}
		return c.redirect(url.toString());
	})
	.get(
		"/callback",
		zValidator("cookie", callbackCookieSchema),
		zValidator("query", callbackQuerySchema),
		async (c) => {
			const { code, state } = c.req.valid("query");
			const { github_oauth_state, oauth_redirect_to } = c.req.valid("cookie");

			if (state !== github_oauth_state) {
				throw new HTTPException(400, {
					message: "Invalid GitHub OAuth flow",
					cause: "invalid_oauth_flow",
				});
			}

			let tokens: OAuth2Tokens;
			try {
				tokens = await github.validateAuthorizationCode(code);
			} catch (error) {
				console.error("OAuth flow error:", error);
				throw new HTTPException(400, {
					message: "Invalid OAuth request",
				});
			}

			const githubResponse = await fetch(OAUTH_API_URL, {
				headers: { Authorization: `Bearer ${tokens.accessToken()}` },
			});
			const githubUser = (await githubResponse.json()) as GitHubUser;

			const user = await db
				.transaction(async (trx) => {
					const user = await insertUserWithProfile(githubUser, trx);

					// TODO: Fix it creating a chat every time
					const insertedChatId = await insertSelfChat(user.username, trx);
					await insertSelfChatMembership(insertedChatId, user.id, trx);

					return user;
				})
				.catch((error: Error) => {
					throw new HTTPException(500, {
						message: error.message,
					});
				});

			await createAndSetSessionCookie(c, user.id);
			return c.redirect(oauth_redirect_to || REDIRECT_URL);
		},
	);

async function createAndSetSessionCookie(c: HonoContext<Env>, userId: string) {
	const token = generateSessionToken();
	const session = await createSession(userId, token);
	setCookie(c, "auth_session", token, {
		...cookieConfig,
		expires: session.expiresAt,
	});
}

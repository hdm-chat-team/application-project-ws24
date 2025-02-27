import { createId } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { generateState } from "arctic";
import type { Context as HonoContext } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Env } from "#api/app.env";
import { createRouter } from "#api/factory";
import { type GitHubEmail, type GitHubUser, github } from "#auth/oauth";
import { createSession, generateSessionToken } from "#auth/session";
import {
	insertChatMembership,
	insertSelfChat,
	selectUserSelfChat,
} from "#db/chats";
import { upsertDevice, upsertDeviceSync } from "#db/devices";
import { upsertUser, upsertUserProfile } from "#db/users";
import env, { DEV } from "#env";
import cookieConfig from "#lib/cookie";
import {
	githubOauthCallbackCookieSchema,
	githubOauthCallbackQuerySchema,
} from "./validators";

const OAUTH_API_URL = "https://api.github.com/user";
const OAUTH_EMAIL_URL = "https://api.github.com/user/emails";
const REDIRECT_URL = DEV ? "http://localhost:5173" : env.APP_URL;

const TWO_MINUTES = 2 * 60;
const THIRTY_DAYS = 30 * 24 * 60 * 60;

export const githubRouter = createRouter()
	.get("/", async (c) => {
		const state = generateState();
		const url = github.createAuthorizationURL(state, [
			"read:user",
			"user:email",
		]);

		// Set state cookie
		setCookie(c, "github_oauth_state", state, {
			...cookieConfig,
			maxAge: TWO_MINUTES,
		});

		// Use existing device ID from cookie or create new one
		const deviceId = getCookie(c, "device_id") ?? createId();
		setCookie(c, "device_id", deviceId, {
			...cookieConfig,
			maxAge: THIRTY_DAYS,
		});

		return c.redirect(url.toString());
	})
	.get(
		"/callback",
		zValidator("cookie", githubOauthCallbackCookieSchema),
		zValidator("query", githubOauthCallbackQuerySchema),
		async (c) => {
			// * Validation

			// Oauth state
			const { state } = c.req.valid("query");
			const storedState = c.req.valid("cookie").github_oauth_state;
			if (state !== storedState)
				return c.json({ message: "Invalid state" }, 400);

			// device id cookie
			const deviceId = c.req.valid("cookie").device_id;
			if (!deviceId) return c.json({ message: "Invalid device id" }, 400);

			// code
			const { code } = c.req.valid("query");

			// * Access token
			const tokens = await github.validateAuthorizationCode(code);
			const accessToken = tokens.accessToken();
			if (!accessToken)
				return c.json({ message: "Invalid Oauth Request" }, 403);

			// * Fetch Github user and email
			const githubUser = await fetchGithubUser(accessToken);
			const githubEmail = await fetchPrimaryGithubEmail(accessToken);
			if (!(githubUser && githubEmail))
				return c.json({ message: "Failed to fetch user" }, 500);

			// * Database operations

			// Upsert user and profile
			const [upsertedUser] = await upsertUser.execute({
				githubId: githubUser.id.toString(),
				username: githubUser.login,
				email: githubEmail,
			});

			await upsertUserProfile.execute({
				userId: upsertedUser.id,
				displayName: githubUser.name ?? githubUser.login,
				avatarUrl: githubUser.avatar_url,
				htmlUrl: githubUser.html_url,
			});

			// Upsert device and device sync
			const [upsertedDevice] = await upsertDevice.execute({
				userId: upsertedUser.id,
				deviceId,
			});

			await upsertDeviceSync.execute({
				userId: upsertedUser.id,
				deviceId: upsertedDevice.id,
			});

			// Insert self chat and membership when needed
			const hasChat = await selectUserSelfChat
				.execute({ userId: upsertedUser.id })
				.then((result) => !!result);

			if (!hasChat) {
				const [{ id: insertedChatId }] = await insertSelfChat.execute();
				await insertChatMembership.execute({
					chatId: insertedChatId,
					userId: upsertedUser.id,
					role: "owner",
				});
			}

			// * Finish

			// Clear cookies
			deleteCookie(c, "github_oauth_state");

			// Set device id and session cookie
			await createAndSetSessionCookie(c, upsertedUser.id, upsertedDevice.id);

			// Redirect to app
			return c.redirect(REDIRECT_URL);
		},
	);

// * Utility functions
async function createAndSetSessionCookie(
	c: HonoContext<Env>,
	userId: string,
	deviceId: string,
) {
	const token = generateSessionToken();
	const session = await createSession(userId, token, deviceId);
	setCookie(c, "auth_session", token, {
		...cookieConfig,
		expires: session.expiresAt,
	});
}

async function fetchGithubUser(accessToken: string): Promise<GitHubUser> {
	return await fetch(OAUTH_API_URL, {
		headers: { Authorization: `Bearer ${accessToken}` },
	}).then((res) => res.json() as Promise<GitHubUser>);
}

async function fetchPrimaryGithubEmail(
	accessToken: string,
): Promise<string | undefined> {
	const result = await fetch(OAUTH_EMAIL_URL, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			accept: "application/vnd.github+json",
		},
	}).then((res) => res.json() as Promise<GitHubEmail[]>);

	return result.find((email) => email.primary)?.email;
}

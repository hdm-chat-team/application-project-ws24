import { createId } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { generateState } from "arctic";
import type { Context as HonoContext } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Env } from "#api/app.env";
import { createRouter } from "#api/factory";
import { type GitHubEmail, type GitHubUser, github } from "#auth/oauth";
import { createSession, generateSessionToken } from "#auth/session";
import { upsertSelfChat, upsertSelfChatWithMembership } from "#db/chats";
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
			// Validate state
			const { state } = c.req.valid("query");
			const storedState = c.req.valid("cookie").github_oauth_state;
			if (state !== storedState)
				return c.json({ message: "Invalid state" }, 400);

			// Validate device id
			const deviceId = c.req.valid("cookie").device_id;
			console.log("device", deviceId);
			if (!deviceId) return c.json({ message: "Invalid device id" }, 400);

			// Validate code and get access token
			const { code } = c.req.valid("query");
			const tokens = await github.validateAuthorizationCode(code);
			const accessToken = tokens.accessToken();
			if (!accessToken)
				return c.json({ message: "Invalid Oauth Request" }, 403);

			// Fetch Github user and email
			const githubUser = await fetchGithubUser(accessToken);
			const githubEmail = await fetchPrimaryGithubEmail(accessToken);
			if (!(githubUser && githubEmail))
				return c.json({ message: "Failed to fetch user" }, 500);

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

			// Upsert self chat and membership
			const [{ id: upsertedChatId }] = await upsertSelfChat.execute();

			await upsertSelfChatWithMembership.execute({
				chatId: upsertedChatId,
				userId: upsertedUser.id,
				role: "owner",
			});

			// Clear cookies
			deleteCookie(c, "github_oauth_state");

			// Set device id and session cookie
			await createAndSetSessionCookie(c, upsertedUser.id, upsertedDevice.id);

			// Redirect to app
			return c.redirect(REDIRECT_URL);
		},
	);

// * utility functions
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
): Promise<GitHubEmail | undefined> {
	const result = await fetch(OAUTH_EMAIL_URL, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			accept: "application/vnd.github+json",
		},
	}).then((res) => res.json() as Promise<GitHubEmail[]>);

	return result.find((email) => email.primary);
}

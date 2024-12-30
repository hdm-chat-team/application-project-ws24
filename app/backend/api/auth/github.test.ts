import { describe, expect, mock, test } from "bun:test";
import { testClient } from "hono/testing";
import { createRouter } from "#api/factory";
import { githubRouter } from "./github";

const MOCK_STATE = crypto.randomUUID();
const MOCK_CODE = "test-code-456";

// Mock GitHub OAuth client
mock.module("#auth/oauth", () => ({
	github: {
		createAuthorizationURL: () =>
			new URL("https://github.com/login/oauth/authorize"),
		validateAuthorizationCode: mock(() =>
			Promise.resolve({ accessToken: () => "mock-access-token" }),
		),
	},
}));

// TODO: mock more things

const { router } = testClient(createRouter().route("/router", githubRouter));

describe("/api/auth/github", () => {
	describe("GET /", () => {
		test.todo("redirects to GitHub OAuth page", async () => {
			const res = await router.$get({ query: { from: "" } });

			expect(res.status).toBe(302);
			expect(res.headers.get("location")).toContain(
				"https://github.com/login/oauth/authorize",
			);
		});

		test.todo("sets oauth state cookie", async () => {
			const res = await router.$get({ query: { from: "" } });
			const cookies = res.headers.getSetCookie();
			expect(cookies).toContain(`github_oauth_state=${MOCK_STATE}`);
		});

		test.todo(
			"sets redirect cookie when from parameter is provided",
			async () => {
				const from = "http://localhost:5173/callback";
				const res = await router.$get({
					query: { from },
				});
				const cookies = res.headers.get("set-cookie");
				expect(cookies).toContain(
					`oauth_redirect_to=${encodeURIComponent(from)}`,
				);
			},
		);
	});

	describe("GET /callback", () => {
		test.todo("validates oauth state from cookie", async () => {
			const res = await router.callback.$get({
				query: {
					code: MOCK_CODE,
					state: "invalid-state",
				},
				cookie: {
					github_oauth_state: MOCK_STATE,
				},
			});
			expect(res.ok).toBe(false);
		});

		test.todo("creates new user on first login", async () => {
			const res = await router.callback.$get({
				query: {
					code: MOCK_CODE,
					state: MOCK_STATE,
				},
				cookie: {
					github_oauth_state: MOCK_STATE,
				},
			});
			expect(res.status).toBe(302);
			expect(global.fetch).toHaveBeenCalledWith(
				"https://api.github.com/user",
				expect.objectContaining({
					headers: { Authorization: "Bearer mock-access-token" },
				}),
			);
		});

		test.todo("creates session for existing user", async () => {
			const res = await router.callback.$get({
				query: {
					code: MOCK_CODE,
					state: MOCK_STATE,
				},
				cookie: {
					github_oauth_state: MOCK_STATE,
				},
			});
			const cookies = res.headers.get("set-cookie");
			expect(cookies).toContain("auth_session=");
		});
	});
});

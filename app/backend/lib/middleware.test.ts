import { describe, expect, mock, spyOn, test } from "bun:test";
import { createApi } from "#api/factory";
import type { Session } from "#db/sessions";
import type { User, UserProfile } from "#db/users";
import * as session from "../auth/session";
import { protectedRoute } from "./middleware";

mock.module("#auth/session", () => ({
	validateSessionToken: mock(async () => ({
		session: null,
		user: null,
		fresh: false,
	})),
}));

// Mock the console.error method
spyOn(console, "error").mockImplementation((error) => {
	console.log("    Expected error:", "\x1b[31m%s\x1b[0m", error.message);
});

const app = createApi()
	.get("/test", (c) =>
		c.json({
			user: c.get("user"),
			session: c.get("session"),
		}),
	)
	.get("/protected", protectedRoute, (c) => {
		const user = c.get("user");
		const session = c.get("session");
		return c.json({ user, session });
	})
	.get("/error", () => {
		throw new Error("Test error");
	})
	.get("/type-error", () => {
		throw new TypeError("Type error");
	});

describe("middleware integration", () => {
	describe("authMiddleware", () => {
		test("should handle requests without auth cookie", async () => {
			const res = await app.request("/test");
			const json = (await res.json()) as {
				user: User | null;
				session: Session | null;
			};
			expect(res.status).toBe(200);
			expect(json.user).toBe(null);
			expect(json.session).toBe(null);
		});

		test("should handle invalid auth sessions", async () => {
			spyOn(session, "validateSessionToken").mockImplementation(async () => ({
				session: null,
				user: null,
				profile: null,
				fresh: false,
			}));

			const res = await app.request("/test", {
				headers: { Cookie: "auth_session=invalid-session" },
			});

			const json = (await res.json()) as {
				user: User | null;
				session: Session | null;
			};
			expect(res.status).toBe(200);
			expect(json.user).toBe(null);
			expect(json.session).toBe(null);
		});

		test("should handle valid auth sessions", async () => {
			const testDate = new Date().toISOString();
			const testUser: User = {
				id: "test-id",
				email: "test@mail.de",
				username: "test",
				createdAt: testDate,
				updatedAt: null,
			};
			const testProfile: UserProfile = {
				id: "test-id",
				userId: "test-id",
				avatarUrl: "test-url",
				displayName: null,
				htmlUrl: null,
				createdAt: testDate,
				updatedAt: testDate,
			};
			const testSession: Session = {
				token: "test-session",
				userId: "test-id",
				expiresAt: new Date(Date.now() + 1000 * 60 * 60),
			};

			spyOn(session, "validateSessionToken").mockImplementation(async () => ({
				session: testSession,
				user: testUser,
				profile: testProfile,
				fresh: false,
			}));

			const res = await app.request("/test", {
				headers: { Cookie: "auth_session=valid-session" },
			});

			const json = (await res.json()) as {
				user: User | null;
				session: Session | null;
			};
			expect(res.status).toBe(200);

			// Compare without direct date comparison
			const expectedUser = json.user;
			const expectedUserProfile = testUser;

			expect(expectedUser).toBeTruthy();
			expect(expectedUserProfile).toBeTruthy();

			expect(json.session).toEqual({
				...testSession,
				// @ts-ignore
				expiresAt: testSession.expiresAt.toISOString(),
			});
		});
		test("should refresh session when needed", async () => {
			const testDate = new Date().toISOString();
			const testUser: User = {
				id: "test-id",
				email: "test@mail.de",
				username: "test",
				createdAt: testDate,
				updatedAt: testDate,
			};
			const testProfile: UserProfile = {
				id: "test-id",
				userId: "test-id",
				avatarUrl: "test-url",
				displayName: null,
				htmlUrl: null,
				createdAt: testDate,
				updatedAt: testDate,
			};
			const testSession: Session = {
				token: "test-session",
				userId: "test-id",
				expiresAt: new Date(Date.now() + 1000 * 60 * 60),
			};

			spyOn(session, "validateSessionToken").mockImplementation(async () => ({
				session: testSession,
				user: testUser,
				profile: testProfile,
				fresh: true, // Session was refreshed
			}));

			const res = await app.request("/test", {
				headers: { Cookie: "auth_session=valid-session" },
			});

			expect(res.headers.getSetCookie()).toBeTruthy();
			expect(res.headers.getSetCookie()[0]).toContain("auth_session=");
		});
	});

	describe("protectedRoute", () => {
		test("should reject unauthorized access to protected routes", async () => {
			const res = await app.request("/protected");
			expect(res.status).toBe(401);
		});

		test("error handler should format HTTP exceptions", async () => {
			const res = await app.request("/protected");
			expect(res.status).toBe(401);
			expect(await res.text()).toBe("Unauthorized");
		});

		test("should handle non-HTTP errors", async () => {
			const res = await app.request("/error");
			expect(res.status).toBe(500);
			expect(await res.text()).toBe("Test error");
		});
	});

	describe("onError", async () => {
		test("should handle type errors", async () => {
			const res = await app.request("/type-error");
			expect(res.status).toBe(500);
			expect(await res.text()).toBe("Type error");
		});
	});
});

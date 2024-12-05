import { describe, expect, mock, test } from "bun:test";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { authMiddleware, onError, protectedRoute } from "./middleware";
import type { Env } from "./types";

// @ts-ignore - intentionally loose
const mockGetCookie = mock((c: Context, name: string) => null);

// @ts-ignore - intentionally any
const mockSetCookie = mock(
	// @ts-ignore - intentionally any
	// biome-ignore lint/suspicious/noExplicitAny: intentionally any
	(c: Context, name: string, value: string, opts?: any) => {},
);

// @ts-ignore - will be used in implementation
const mockDeleteCookie = mock((c: Context, name: string) => {});
const mockValidateSessionToken = mock(async () => ({
	session: null,
	user: null,
	fresh: false,
}));

// * Create mock context with test helpers
const createMockContext = (
	headers: Record<string, string> = {},
): Context<Env> =>
	({
		req: {
			raw: new Request("http://localhost/", {
				headers: new Headers(headers),
			}),
		},

		// @ts-ignore - intentionally loose typing for test context
		var: new Map(),
		get: function (key: string) {
			return this.var.get(key);
		},

		// @ts-ignore - any for testing
		// biome-ignore lint/suspicious/noExplicitAny: any for testing
		set: function (key: string, value: any) {
			this.var.set(key, value);
		},

		// Add mock functions directly to context
		getCookie: mockGetCookie,
		setCookie: mockSetCookie,
		deleteCookie: mockDeleteCookie,
		validateSessionToken: mockValidateSessionToken,
		// biome-ignore lint/suspicious/noExplicitAny: any for testing
	}) as any;

describe("authMiddleware", () => {
	const next = mock(() => Promise.resolve());

	test("should set user and session to null if no auth_session cookie", async () => {
		const c = createMockContext();
		mockGetCookie.mockImplementation(() => null);

		await authMiddleware(c as Context, next);

		expect(c.get("user")).toBe(null);
		expect(c.get("session")).toBe(null);
		expect(next).toHaveBeenCalled();
	});

	test.todo(
		"should validate session token and set user and session",
		async () => {
			// @ts-ignore - used in implementation
			const session = { id: "session-id", expiresAt: new Date() };
			// @ts-ignore - used in implementation
			const user = { id: "user-id" };
			// @ts-ignore - used in implementation
			const c = createMockContext({
				Cookie: "auth_session=session-id",
			});
		},
	);

	test.todo("should delete cookie if session is invalid", async () => {
		// @ts-ignore - used in implementation
		const c = createMockContext({
			Cookie: "auth_session=invalid-session-id",
		});
	});
});

describe("protectedRoute", () => {
	const next = mock(() => Promise.resolve());

	test("should throw 401 if user or session is missing", async () => {
		const c = createMockContext();

		expect(protectedRoute(c as Context, next)).rejects.toThrow(HTTPException);
		expect(next).not.toHaveBeenCalled();
	});

	test("should set authenticatedUser and authenticatedSession if user and session are valid", async () => {
		const user = { id: "user-id" };
		const session = { id: "session-id" };
		const c = createMockContext();

		// @ts-ignore
		c.set("user", user);
		// @ts-ignore
		c.set("session", session);

		await protectedRoute(c as Context, next);

		// @ts-ignore
		expect(c.get("authenticatedUser")).toEqual(user);
		// @ts-ignore
		expect(c.get("authenticatedSession")).toEqual(session);
		expect(next).toHaveBeenCalled();
	});

	describe("onError", () => {
		test("should handle non-HTTPException errors", async () => {
			const error = new Error("Test error");
			error.cause = "Test cause";

			const response = await onError(error);
			expect(response.status).toBe(500);
			expect(response.statusText).toBe("Internal error: Test cause");
			expect(await response.text()).toBe("Test error");
		});

		test("should handle HTTPException errors", async () => {
			const httpError = new HTTPException(400, {
				message: "Bad Request",
			});

			const response = await onError(httpError);
			expect(response.status).toBe(400);
			expect(await response.text()).toBe("Bad Request");
		});
	});
});

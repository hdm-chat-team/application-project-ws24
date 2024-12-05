import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import { createApi } from "#lib/factory";
import { authRouter } from ".";

// Create test API with mocked auth state
const { auth } = testClient(createApi().route("/auth", authRouter));

describe("/api/auth", () => {
	test("GET /signout without auth returns 401", async () => {
		const res = await auth.signout.$get();
		expect(res.ok).toBeFalse();
	});

	test.todo("GET /signout with auth redirects", async () => {
		const res = await auth.signout.$get();
		expect(res.ok).toBeTrue();
		expect(res.redirect).toBeTruthy();
	});
});

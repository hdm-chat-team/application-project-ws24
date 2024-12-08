import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import { createRouter } from "#lib/factory";
import { authRouter } from ".";

const { auth } = testClient(createRouter().route("/auth", authRouter));

describe("/api/auth", () => {
	test("GET /signout without auth returns 401", async () => {
		const res = await auth.signout.$get();
		expect(res.ok).toBeFalse();
	});

	test.todo("GET /signout with auth redirects", async () => {
		const res = await auth.signout.$get({});
		expect(res.ok).toBeTrue();
		expect(res.redirect).toBeTruthy();
	});
});

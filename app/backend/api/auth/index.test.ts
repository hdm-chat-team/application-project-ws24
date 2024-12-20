import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import { createRouter } from "#api/factory";
import { authRouter } from ".";

const { auth } = testClient(createRouter().route("/auth", authRouter));

describe("/api/auth", () => {
	describe("GET /signout", () => {
		test("without auth returns 401", async () => {
			const res = await auth.signout.$get({
				query: { from: "" },
			});
			expect(res.ok).toBeFalse();
		});

		test.todo("with auth redirects", async () => {
			const from = "http://localhost:5173";
			const res = await auth.signout.$get({
				query: { from },
			});
			expect(res.ok).toBeTrue();
			expect(res.status).toBe(302);
			expect(res.headers.get("location")).toBe(from);
		});
	});

	describe("GET /", () => {
		test.todo("with auth returns user data", async () => {
			const res = await auth.$get();
			expect(res.ok).toBeTrue();
		});
	});
});

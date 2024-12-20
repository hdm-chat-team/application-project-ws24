import { describe, test } from "bun:test";

describe("/api/user", () => {
	describe("GET /me", () => {
		test.todo("prevents unauthenticated access", async () => {});
		test.todo("returns the users profile", async () => {});
	});
	describe("PUT /me", () => {
		test.todo("validates formData", async () => {});
		test.todo("updates user profile", async () => {});
	});
	describe("GET /:id", () => {
		test.todo("validates CUID", async () => {});
		test.todo("returns user profile", async () => {});
	});
});

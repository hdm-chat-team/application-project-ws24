import { beforeAll, describe, expect, spyOn, test } from "bun:test";
import { HTTPException } from "hono/http-exception";
import { createApi, createRouter, onError } from "./factory";

describe("factory", () => {
	beforeAll(() => {
		// Mock the console.error method
		spyOn(console, "error").mockImplementation((error) => {
			console.info(error.toString());
		});
	});

	describe("createRouter", () => {
		test("should create a router instance", () => {
			const router = createRouter();
			expect(router).toBeDefined();
			expect(router.routes).toBeDefined();
		});
	});

	describe("createApi", () => {
		test("should create an API with middleware", () => {
			const api = createApi();
			expect(api).toBeDefined();
			expect(api.routes).toBeDefined();
		});
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

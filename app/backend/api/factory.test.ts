import { beforeAll, describe, expect, spyOn, test } from "bun:test";
import { createApi, createRouter } from "./factory";

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
});

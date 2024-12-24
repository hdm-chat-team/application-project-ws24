import { describe, expect, mock, test } from "bun:test";
import { createMiddleware } from "hono/factory";
import { testClient } from "hono/testing";
import app, { type ApiType } from "./app";

const { api } = testClient(app as ApiType);

mock.module("#/lib/middleware", () => ({
	limiter: createMiddleware(async (_, next) => {
		return next();
	}),
}));

describe("/api", () => {
	test("GET /", async () => {
		const res = await api.$get();

		expect(await res.text()).toBe("Connected!");
	});
});

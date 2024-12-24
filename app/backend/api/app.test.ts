import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import app, { type ApiType } from "./app";

describe("/api", () => {
	test("GET /", async () => {
		const { api } = testClient(app as ApiType);
		const res = await api.$get();

		expect(await res.text()).toBe("Connected!");
	});
});

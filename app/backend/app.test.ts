import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import app, { type ApiType } from "./app";

const { api } = testClient(app as ApiType);

describe("/api", () => {
	test("GET /", async () => {
		const res = await api.$get();
		expect(res.ok).toBeTrue();
	});
});

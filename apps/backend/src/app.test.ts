import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import app from "src/app";
import type { ClientType } from "src/client";

const { api } = testClient(app) as ClientType;

describe("rest", () => {
	test("GET /", async () => {
		const res = await api.$get();
		expect(res.ok).toBe(true);
	});
});

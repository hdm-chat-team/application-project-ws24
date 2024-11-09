import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import app from "../../app";
import type { ClientType } from "../../types";

const { api } = testClient(app) as ClientType;

describe("rest", () => {
	test("GET /", async () => {
		const res = await api.rest.$get();
		expect(res.ok).toBe(true);
	});
});

import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import api from "./app";

const client = testClient(api);

describe("/api", () => {
	test("GET /", async () => {
		const res = await client.api.$get();
		expect(res.ok).toBe(true);
	});
});

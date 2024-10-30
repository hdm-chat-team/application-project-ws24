import { expect, test } from "bun:test";
import { testClient } from "hono/testing";
import app from ".";
import type { ClientType } from ".";

const client = testClient(app) as ClientType;

test("GET /", async () => {
	const res = await client.api.$get();
	expect(res.ok).toBe(true);
});

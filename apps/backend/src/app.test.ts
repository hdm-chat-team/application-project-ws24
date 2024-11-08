import { expect, test } from "bun:test";
import { testClient } from "hono/testing";
import type { ClientType } from "./types";
import app from "./app";

const { api } = testClient(app) as ClientType;

test("GET /", async () => {
	const res = await api.$get();
	expect(res.ok).toBe(true);
});

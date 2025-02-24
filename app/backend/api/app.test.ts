import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import { type ApiType, app } from "./app";

const { api } = testClient(app as ApiType);

describe("/api", () => {
	test("GET /", async () => {
		const res = await api.$get();

		expect(res.ok).toBe(true);
		expect(res.status).toBe(200);
		expect(await res.text()).toBeTruthy();
	});
});

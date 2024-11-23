import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import { chat } from "./chat";

const client = testClient(chat);

describe("/api/chat", () => {
	test("GET /", async () => {
		const res = client.index.$ws();
		expect(res).toBeInstanceOf(WebSocket);
	});
});

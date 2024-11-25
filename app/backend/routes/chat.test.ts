import { createApi } from "#lib/factory";
import { describe, expect, test } from "bun:test";
import { testClient } from "hono/testing";
import { chatRouter } from "./chat";

const { chat } = testClient(createApi().route("/chat", chatRouter));

describe("/api/chat", () => {
	test("GET /", async () => {
		const res = chat.$ws();
		expect(res).toBeInstanceOf(WebSocket);
	});
});

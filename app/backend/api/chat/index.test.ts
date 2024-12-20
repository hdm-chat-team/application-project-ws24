import { describe, expect, test } from "bun:test";
import { createId } from "@application-project-ws24/cuid";
import { testClient } from "hono/testing";
import { createApi } from "#api/factory";
import { chatRouter } from ".";

const { chat } = testClient(createApi().route("/chat", chatRouter));

describe("/api/chat", () => {
	describe("POST /:id", () => {
		test("returns 401 when not authorized", async () => {
			const res = chat[":id"].$post({
				param: { id: createId() },
				form: { body: "test" },
			});
			expect((await res).ok).toBe(false);
		});

		test.todo("returns 200 when authorized", async () => {
			const res = chat[":id"].$post({
				param: { id: createId() },
				form: { body: "test" },
			});
			expect((await res).status).toBe(200);
		});
	});
});

import { describe, expect, test } from "bun:test";
import { createId } from "@application-project-ws24/cuid";
import { testClient } from "hono/testing";
import { createApi } from "#api/factory";
import type { Message } from "#db/messages";
import { chatRouter } from ".";

const { chat } = testClient(createApi().route("/chat", chatRouter));

const mockMessage: Message = {
	id: createId(),
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	state: "pending",
	body: "test",
	authorId: createId(),
	chatId: createId(),
};

describe("/api/chat", () => {
	describe("POST /", () => {
		test("returns 401 when not authorized", async () => {
			const res = chat.$post({
				form: mockMessage,
			});
			// @ts-ignore
			expect((await res).ok).toBe(false);
		});

		test.todo("returns 200 when authorized", async () => {
			const res = chat.$post({
				form: mockMessage,
			});
			expect((await res).status).toBe(201);
			expect((await res).ok).toBeTrue();
		});
	});
});

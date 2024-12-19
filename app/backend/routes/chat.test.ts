import { describe, expect, mock, test } from "bun:test";
import { createId } from "@application-project-ws24/cuid";
import type { Env } from "hono";
import { createMiddleware } from "hono/factory";
import { testClient } from "hono/testing";
import type { Session } from "#db/sessions";
import type { User } from "#db/users";
import { createApi } from "#lib/factory";
import { chatRouter } from "./chat";

const { chat } = testClient(createApi().route("/chat", chatRouter));

mock.module("#lib/middleware", () => ({
	protectedRoute: createMiddleware<
		Env & {
			Variables: { user: User; session: Session };
		}
	>(async (c, next) => {
		const session = {
			token: createId(),
			userId: createId(),
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
		};
		const user = {
			id: session.userId,
			githubId: "test123",
			username: "Test User",
			email: "test@example.com",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		c.set("user", user);
		c.set("session", session);
		return next();
	}),
}));

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

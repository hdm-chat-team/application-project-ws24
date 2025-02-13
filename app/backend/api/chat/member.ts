import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import {
	deleteChatMembership,
	insertChatMembership,
	insertChatMembershipSchema,
} from "#db/chats";
import { protectedRoute } from "#lib/middleware";

export const chatMemberRouter = createRouter()
	.post(
		"/",
		protectedRoute,
		zValidator("form", insertChatMembershipSchema),
		async (c) => {
			const membership = c.req.valid("form");

			const [insertedMembership] = await insertChatMembership
				.execute(membership)
				.catch((error) => {
					throw new HTTPException(500, {
						message: error.message,
						cause: error.cause,
					});
				});

			return c.json({ data: insertedMembership });
		},
	)
	.delete(
		"/",
		protectedRoute,
		zValidator("form", insertChatMembershipSchema),
		async (c) => {
			const membership = c.req.valid("form");

			const [deletedMembership] = await deleteChatMembership
				.execute(membership)
				.catch((error) => {
					throw new HTTPException(500, {
						message: error.message,
						cause: error.cause,
					});
				});

			return c.json({ data: deletedMembership });
		},
	);

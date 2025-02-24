import { zValidator } from "@hono/zod-validator";
import { createRouter } from "#api/factory";
import {
	deleteChatMembership,
	insertChatMembership,
	insertChatMembershipSchema,
} from "#db/chats";

export const chatMembershipRouter = createRouter()
	.post("/", zValidator("form", insertChatMembershipSchema), async (c) => {
		const membership = c.req.valid("form");

		const [insertedMembership] = await insertChatMembership.execute(membership);

		return c.json({ data: insertedMembership });
	})
	.delete(zValidator("form", insertChatMembershipSchema), async (c) => {
		const membership = c.req.valid("form");

		const [deletedMembership] = await deleteChatMembership.execute(membership);

		return c.json({ data: deletedMembership });
	});

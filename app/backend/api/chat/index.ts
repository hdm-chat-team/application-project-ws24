import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { HTTPException } from "hono/http-exception";
import { messageRouter } from "#api/chat/message";
import { createRouter } from "#api/factory";
import { insertChatWithMembers } from "#db/chats";
import { chatMemberTable } from "#db/chats.sql";
import { selectUser } from "#db/users";
import { protectedRoute } from "#lib/middleware";

const createChatSchema = createInsertSchema(chatMemberTable);

export const chatRouter = createRouter()
	.route("/messages", messageRouter)
	.post(
		"/",
		zValidator("json", createChatSchema),
		protectedRoute,
		async (c) => {
			const formData = await c.req.formData();
			const { userId } = createChatSchema.parse(formData);
			const currentUser = c.get("user");
			const userToCreateChatWith = await selectUser.execute({
				id: userId,
			});

			if (!userToCreateChatWith) {
				throw new HTTPException(404, {
					message: `User with id ${userId} does not exist`,
				});
			}

			const userIds = [currentUser.id, userToCreateChatWith.id];
			const result = await insertChatWithMembers(userIds);

			return c.json(result);
		},
	);

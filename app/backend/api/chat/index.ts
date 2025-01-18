import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { messageRouter } from "#api/chat/message";
import { createRouter } from "#api/factory";
import { insertChatWithMembers } from "#db/chats";
import { selectUser } from "#db/users";
import { protectedRoute } from "#lib/middleware";

const createChatSchema = z.object({
	userId: z.string().min(1, "User Id is required"),
});

export const chatRouter = createRouter()
	.route("/messages", messageRouter)
	.post(
		"/",
		zValidator("json", createChatSchema),
		protectedRoute,
		async (c) => {
			const { userId } = c.req.valid("json");
			const currentUser = c.get("user");
			const userToCreateChatWith = await selectUser.execute({
				id: userId,
			});

			if (!userToCreateChatWith) {
				throw new HTTPException(404, {
					message: `User with id ${userId} does not exist`,
				});
			}

			// Prüfen ob Chat schon existiert --> Zwei Einträge in Chat_members die die selbe chatId haben mit userIdA und userIdB
			const result = await insertChatWithMembers(
				currentUser,
				userToCreateChatWith,
			);
			return c.json(result);
		},
	);

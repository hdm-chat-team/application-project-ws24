import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createRouter } from "#api/factory";
import { insertChatWithMembers } from "#db/chats";
import { selectUser } from "#db/users";
import { protectedRoute } from "#lib/middleware";
import { messageRouter } from "./message";

const createChatSchema = z.object({
	userId: z.string().min(1, "User Id is required"),
});

export const chatRouter = createRouter()
	.route("/messages", messageRouter)
	.post(
		"/:id",
		zValidator("param", cuidParamSchema),
		zValidator("json", createChatSchema),
		protectedRoute,
		async (c) => {
			const { userId } = c.req.valid("json");
			const currentUser = c.get("user");
			const userToCreateChatWith = await selectUser.execute({
				id: userId,
			});

			if (!userToCreateChatWith) {
				return c.text(`User with id ${userId} does not exist`);
			}

			// Prüfen ob Chat schon existiert --> Zwei Einträge in Chat_members die die selbe chatId haben mit userIdA und userIdB
			const result = await insertChatWithMembers(
				currentUser,
				userToCreateChatWith,
			);
			return c.json(result);
		},
	);

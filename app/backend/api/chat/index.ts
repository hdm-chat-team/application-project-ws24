import {zValidator} from "@hono/zod-validator";
import {messageRouter} from "#api/chat/message";
import {createRouter} from "#api/factory";
import {insertChatWithMembers} from "#db/chats";
import {protectedRoute} from "#lib/middleware";
import {z} from "zod";

const chat = z.object({
	userIds: z.string().array().or(z.string()),
})
export const chatRouter = createRouter()
	.route("/messages", messageRouter)
	.post(
		"/",
		zValidator("form", chat),
		protectedRoute,
		async (c) => {
			const {userIds} = c.req.valid("form");
			const currentUser = c.get("user");
			const parsedUserIds = typeof userIds === 'string' ? [userIds] : userIds
			const result = await insertChatWithMembers([currentUser.id, ...parsedUserIds]);
			return c.json(result);
		},
	);

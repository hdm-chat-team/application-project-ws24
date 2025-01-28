import {zValidator} from "@hono/zod-validator";
import {messageRouter} from "#api/chat/message";
import {createRouter} from "#api/factory";
import {InsertChatErrors, insertChatWithMembers} from "#db/chats";
import {protectedRoute} from "#lib/middleware";
import {z} from "zod";
import {HTTPException} from "hono/http-exception";

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
			try {
				const result = await insertChatWithMembers([currentUser.id, ...parsedUserIds]);
				return c.json(result);
			} catch (e){
				switch (e){
					case InsertChatErrors.MUST_HAVE_TWO:
						throw new HTTPException(400)
					default:
						throw new HTTPException(500)
				}
			}
		},
	);

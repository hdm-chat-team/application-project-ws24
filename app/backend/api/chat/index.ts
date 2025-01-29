import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { DatabaseError } from "pg";
import { createRouter } from "#api/factory";
import db from "#db";
import { insertChat, selectChatMembership, updateChat } from "#db/chats";
import { chatMemberTable } from "#db/chats.sql";
import { protectedRoute } from "#lib/middleware";
import { createChatSchema, updateChatNameFormSchema } from "./validators";

import { chatMemberRouter } from "./member";

export const chatRouter = createRouter()
	.route("/membership", chatMemberRouter)
	.post(
		"/",
		protectedRoute,
		zValidator("form", createChatSchema),
		async (c) => {
			const { members, ...chat } = c.req.valid("form");

			const [insertedChat] = await insertChat
				.execute(chat)
				.catch((error: DatabaseError) => {
					throw new HTTPException(500, {
						message: error.message,
						cause: error.cause,
					});
				});

			const insertedMemberships = await db
				.insert(chatMemberTable)
				.values(members.map((userId) => ({ chatId: insertedChat.id, userId })))
				.returning()
				.catch((error: DatabaseError) => {
					throw new HTTPException(500, {
						message: error.message,
						cause: error.cause,
					});
				});

			/* 
			TODO: publish chat creation event to members
			for (const recipientId of insertedMemberships.map((m) => m.userId))
				publish(recipientId, {
					type: "chat_incoming",
					payload: {updatedChat, memberships: insertedMemberships},
				});
			*/

			return c.json({
				data: { chat: insertedChat, memberships: insertedMemberships },
			});
		},
	)
	.put(
		"/",
		protectedRoute,
		zValidator("form", updateChatNameFormSchema),
		async (c) => {
			const user = c.get("user");
			const { id, name } = c.req.valid("form");

			const isMember = await selectChatMembership
				.execute({ chatId: id, userId: user.id })
				.catch((error: DatabaseError) => {
					throw new HTTPException(500, {
						message: error.message,
						cause: error.cause,
					});
				})
				.then((result) => !!result);

			if (!isMember)
				throw new HTTPException(403, {
					message: "Not a chat member",
					cause: "permissions",
				});

			const [updatedChat] = await updateChat
				.execute({ id, name })
				.catch((error: DatabaseError) => {
					throw new HTTPException(500, {
						message: error.message,
						cause: error.cause,
					});
				});

			/* 
			TODO: publish chat update event to members
			for (const recipientId of updatedChatMemberIds)
				publish(recipientId, {
					type: "chat_updated",
					payload: updatedChat,
				});
			*/
			return c.json({ data: updatedChat });
		},
	)
	.delete(
		"/:id",
		protectedRoute,
		zValidator("param", cuidParamSchema),
		async (c) => {
			// ? Do we need this?
			return c.text(`${c.req.valid("param").id} deleted`);
		},
	);

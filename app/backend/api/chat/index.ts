import { cuidParamSchema, cuidSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createRouter } from "#api/factory";
import { db } from "#db";
import {
	type ChatMembership,
	insertChatSchema,
	insertGroupChat,
	insertGroupChatWithMembershipsSchema,
	selectChatOwnerOrAdminMembership,
	updateChat,
	updateChatSchema,
} from "#db/chats";
import { chatMembershipTable } from "#db/chats.sql";
import { protectedRoute } from "#lib/middleware";
import { publish } from "#lib/utils";
import { chatMembershipRouter } from "./member";

export const chatRouter = createRouter()
	// ! All routes protected
	.use(protectedRoute)
	.route("/membership", chatMembershipRouter)
	.post(
		"/direct",
		zValidator(
			"json",
			insertChatSchema.extend({
				members: z
					.array(cuidSchema)
					.length(2, "direct chat must have 2 members"),
			}),
		),
		async (c) => {
			const userId = c.get("user").id;

			const chat = c.req.valid("json");

			const memberships: Array<ChatMembership> = chat.members.map(
				(memberId) => ({
					chatId: chat.id,
					userId: memberId,
					role: "member",
					joinedAt: new Date().toISOString(),
				}),
			);

			const [insertedChat] = await insertGroupChat.execute(chat);
			const members = await db
				.insert(chatMembershipTable)
				.values(memberships)
				.returning({ userId: chatMembershipTable.userId })
				.then((rows) => rows.map((member) => member.userId));

			publish(userId, {
				type: "chat",
				payload: { ...insertedChat, members },
			});

			return c.json(
				{
					message: "direct chat created",
					data: { chat: insertedChat, members },
				},
				201,
			);
		},
	)
	.post(
		"/group",
		zValidator("json", insertGroupChatWithMembershipsSchema),
		async (c) => {
			const { memberships, chat } = c.req.valid("json");

			const [insertedChat] = await insertGroupChat.execute(chat);

			const insertedMemberships = await db
				.insert(chatMembershipTable)
				.values(memberships)
				.returning({ userId: chatMembershipTable.userId })
				.then((rows) => rows.map((row) => row.userId));

			for (const recipientId of insertedMemberships)
				publish(recipientId, {
					type: "chat",
					payload: { ...insertedChat, members: insertedMemberships },
				});

			return c.json(
				{
					message: "group chat created",
					data: { chat: insertedChat, members: insertedMemberships },
				},
				201,
			);
		},
	)
	.put(
		"/:id",
		zValidator("param", cuidParamSchema),
		zValidator("form", updateChatSchema.pick({ name: true })),
		async (c) => {
			const userId = c.get("user").id;

			const { id: chatId } = c.req.valid("param");
			const { name } = c.req.valid("form");

			const permittedUser = await selectChatOwnerOrAdminMembership.execute({
				chatId,
				userId,
			});

			if (!permittedUser)
				return c.json({ message: "Not permitted", data: null }, 403);

			const [updatedChat] = await updateChat.execute({ id: chatId, name });

			return c.json({ message: "updated", data: updatedChat }, 200);
		},
	)
	.delete("/:id", zValidator("param", cuidParamSchema), async (c) => {
		// ? Do we need this?
		return c.text(`Chat: ${c.req.valid("param").id} deleted`);
	});

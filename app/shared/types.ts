import { cuidSchema } from "@application-project-ws24/cuid";
import { z } from "zod";

const chatWithMembersSchema = z.object({
	id: cuidSchema,
	name: z.string().nullable(),
	type: z.enum(["self", "direct", "group"]),
	members: z.array(cuidSchema),
	createdAt: z.string().nonempty(),
	updatedAt: z.string().nonempty(),
});

const messageSchema = z.object({
	id: cuidSchema,
	authorId: cuidSchema,
	chatId: cuidSchema,
	createdAt: z.string().nonempty(),
	updatedAt: z.string().nonempty(),
	state: z.enum(["pending", "sent", "delivered", "read"]),
	body: z.string().nonempty(),
});

const messageAttachmentSchema = z.object({
	url: z.string().url().nonempty(),
	messageId: cuidSchema,
	type: z.string().nonempty(),
});

export const wsEventDataSchema = z.discriminatedUnion("type", [
	z
		.object({
			type: z.literal("sync:messages"),
			payload: messageSchema,
		})
		.describe("The client receives unsynced messages from the server."),
	z
		.object({
			type: z.literal("sync:chats"),
			payload: chatWithMembersSchema,
		})
		.describe("The client receives unsynced chats from the server."),
	z
		.object({
			type: z.literal("message:incoming"),
			payload: messageSchema,
		})
		.describe("The client receives a new message from the server."),
	z
		.object({
			type: z.literal("message:attachment"),
			payload: messageAttachmentSchema,
		})
		.describe("The client receives a new message attachment from the server."),
	z
		.object({
			type: z.literal("message:received"),
			payload: messageSchema.pick({ id: true, authorId: true }),
		})
		.describe("The client receives message from the server."),
	z
		.object({
			type: z.literal("message:delivered"),
			payload: cuidSchema,
		})
		.describe(
			"The client sends a message delivery confirmation to the server.",
		),
	z
		.object({
			type: z.literal("message:read"),
			payload: messageSchema.pick({ id: true, authorId: true }),
		})
		.describe("The client sends a message read confirmation to the server."),
	z
		.object({
			type: z.literal("message:completed"),
			payload: cuidSchema,
		})
		.describe(
			"The client receives a message completion(read by all recipients) confirmation from the server.",
		),
]);
export type WSEventData = z.infer<typeof wsEventDataSchema>;

export const userSearchQuerySchema = z.object({
	search: z.string().nonempty(),
});
export type UserSearchQuery = z.infer<typeof userSearchQuerySchema>;

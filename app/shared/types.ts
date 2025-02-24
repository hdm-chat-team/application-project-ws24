import { cuidSchema } from "@application-project-ws24/cuid";
import { z } from "zod";

const chatWithMembersSchema = z.object({
	id: cuidSchema,
	name: z.string().nullable(),
	avatarUrl: z.string().url().nullable(),
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
	body: z.string().nullable(),
});

const messageAttachmentSchema = z.object({
	messageId: cuidSchema,
	type: z.string().nonempty(),
});

export const serverToClientWsEventData = z.discriminatedUnion("type", [
	z
		.object({
			type: z.literal("chat"),
			payload: chatWithMembersSchema,
		})
		.describe("The client receives a chat from the server."),
	z
		.object({
			type: z.literal("message"),
			payload: messageSchema,
		})
		.describe("The client receives a message from the server."),
	z
		.object({
			type: z.literal("message:state"),
			payload: messageSchema.pick({ id: true, state: true }),
		})
		.describe("The client receives a message state update from the server."),
	z
		.object({
			type: z.literal("message:attachment"),
			payload: messageAttachmentSchema,
		})
		.describe("The client receives a new message attachment from the server."),
]);
export type ServerToClientWsEventData = z.infer<
	typeof serverToClientWsEventData
>;

export const clientToServerWsEventDataSchema = z.discriminatedUnion("type", [
	z
		.object({
			type: z.literal("message:received"),
			payload: messageSchema.pick({ id: true, authorId: true }),
		})
		.describe("The client receives message from the server."),
	z
		.object({
			type: z.literal("message:read"),
			payload: messageSchema.pick({ id: true, authorId: true }),
		})
		.describe("The client sends a message read confirmation to the server."),
]);
export type ClientToServerWsEventData = z.infer<
	typeof clientToServerWsEventDataSchema
>;

export const userSearchQuerySchema = z.object({
	search: z.string().nonempty(),
});
export type UserSearchQuery = z.infer<typeof userSearchQuerySchema>;

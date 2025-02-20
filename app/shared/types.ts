import { cuidSchema } from "@application-project-ws24/cuid";
import { z } from "zod";

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
			type: z.literal("message_sync"),
			payload: z.array(messageSchema),
		})
		.describe("The client receives unsynced messages from the server."),
	z
		.object({
			type: z.literal("message_incoming"),
			payload: messageSchema,
		})
		.describe("The client receives a new message from the server."),
	z
		.object({
			type: z.literal("message_attachment"),
			payload: messageAttachmentSchema,
		})
		.describe("The client receives a new message attachment from the server."),
	z
		.object({
			type: z.literal("message_received"),
			payload: messageSchema.pick({ id: true, authorId: true }),
		})
		.describe("The client receives message from the server."),
	z
		.object({
			type: z.literal("message_delivered"),
			payload: cuidSchema,
		})
		.describe(
			"The client sends a message delivery confirmation to the server.",
		),
	z
		.object({
			type: z.literal("message_read"),
			payload: messageSchema.pick({ id: true, authorId: true }),
		})
		.describe("The client sends a message read confirmation to the server."),
	z
		.object({
			type: z.literal("message_completed"),
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

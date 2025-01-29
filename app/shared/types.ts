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

const wsEventDataTypeSchema = z.enum([
	"message_sync",
	"message_incoming",
	"message_attachment",
	"message_received",
	"message_delivered",
	"message_read",
	"message_completed",
]);
type WSEventDataType = z.infer<typeof wsEventDataTypeSchema>;

const wsEventDataSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal(wsEventDataTypeSchema.enum.message_sync),
		payload: z.array(messageSchema),
	}),
	z.object({
		type: z.literal(wsEventDataTypeSchema.enum.message_incoming),
		payload: messageSchema,
	}),
	z.object({
		type: z.literal(wsEventDataTypeSchema.enum.message_attachment),
		payload: messageAttachmentSchema,
	}),
	z.object({
		type: z.literal(wsEventDataTypeSchema.enum.message_received),
		payload: messageSchema.pick({ id: true, authorId: true }),
	}),
	z.object({
		type: z.literal(wsEventDataTypeSchema.enum.message_delivered),
		payload: cuidSchema,
	}),
	z.object({
		type: z.literal(wsEventDataTypeSchema.enum.message_read),
		payload: messageSchema.pick({ id: true, authorId: true }),
	}),
	z.object({
		type: z.literal(wsEventDataTypeSchema.enum.message_completed),
		payload: cuidSchema,
	}),
]);
type WSEventData = z.infer<typeof wsEventDataSchema>;

export { /* messageSchema, */ wsEventDataTypeSchema, wsEventDataSchema };
export type { WSEventDataType, WSEventData };

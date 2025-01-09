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

const wsEventDataTypeSchema = z.enum([
	"message_incoming",
	"message_received",
	"message_delivered",
	"message_read",
]);
type WSEventDataType = z.infer<typeof wsEventDataTypeSchema>;

const wsEventDataSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal(wsEventDataTypeSchema.enum.message_incoming),
		payload: messageSchema,
	}),
	z.object({
		type: z.literal(wsEventDataTypeSchema.enum.message_received),
		payload: messageSchema.pick({ id: true, authorId: true }),
	}),
	z.object({
		type: z.literal(wsEventDataTypeSchema.enum.message_delivered),
		payload: cuidSchema,
	}),
]);
type WSEventData = z.infer<typeof wsEventDataSchema>;

export { /* messageSchema, */ wsEventDataTypeSchema, wsEventDataSchema };
export type { WSEventDataType, WSEventData };

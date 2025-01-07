import { createId, cuidSchema } from "@application-project-ws24/cuid";
import { z } from "zod";

const messageSchema = z.object({
	id: cuidSchema,
	authorId: cuidSchema,
	chatId: cuidSchema,
	state: z.enum(["pending", "sent", "delivered", "read"]),
	body: z.string().min(1),
	createdAt: z.string(),
	updatedAt: z.string(),
});

const messageFormSchema = messageSchema.pick({ body: true });

type Message = z.infer<typeof messageSchema>;

function createMessage(
	chatId: string,
	authorId: string,
	body: string,
): Message {
	return messageSchema.parse({
		id: createId(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		state: "pending",
		body,
		authorId,
		chatId,
	});
}

function stringifyMessage(message: Message): string {
	return JSON.stringify(message);
}

function parseMessage(json: string): Message {
	const message = JSON.parse(json);
	return messageSchema.parse(message);
}

export {
	createMessage,
	messageFormSchema,
	messageSchema,
	parseMessage,
	stringifyMessage,
};
export type { Message };

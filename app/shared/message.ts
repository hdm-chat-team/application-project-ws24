import { createId, cuidSchema } from "@application-project-ws24/cuid";
import { z } from "zod";

const messageSchema = z.object({
	id: cuidSchema,
	authorId: cuidSchema,
	chatId: cuidSchema,
	body: z.string().min(1),
	createdAt: z.date(),
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
		createdAt: new Date(),
		body,
		authorId,
		chatId,
	});
}

function stringifyMessage(message: Message): string {
	return JSON.stringify({
		...message,
		createdAt: message.createdAt.toISOString(),
	});
}

function parseMessage(json: string): Message {
	const parsed = JSON.parse(json);
	const message = {
		...parsed,
		createdAt: new Date(parsed.createdAt),
	};
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

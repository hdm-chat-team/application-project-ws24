import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { createRouter } from "#api/factory";
import { protectedRoute } from "#lib/middleware";
import { getServer } from "#lib/utils";
import {
	createMessage,
	messageFormSchema,
	stringifyMessage,
} from "#shared/message";

export const messageRouter = createRouter().post(
	"/:id",
	zValidator("param", cuidParamSchema),
	zValidator("form", messageFormSchema),
	protectedRoute,
	async (c) => {
		const { body } = c.req.valid("form");
		const { id: chatId } = c.req.valid("param");
		const { id: authorId } = c.get("user");

		const message = createMessage(chatId, authorId, body);
		getServer().publish(chatId, stringifyMessage(message));

		return c.text("Message sent");
	},
);

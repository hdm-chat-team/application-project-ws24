import { createRouter } from "#lib/factory";
import { protectedRoute } from "#lib/middleware";
import { getServer } from "#lib/utils";
import {
	createMessage,
	messageFormSchema,
	stringifyMessage,
} from "#shared/message";
import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";

export const chatRouter = createRouter().post(
	"/:id",
	zValidator("param", cuidParamSchema),
	zValidator("form", messageFormSchema),
	protectedRoute,
	async (c) => {
		const { body } = c.req.valid("form");
		const { id: topic } = c.req.valid("param");
		const { id: userId } = c.get("user");

		const message = createMessage(userId, body);
		getServer().publish(topic, stringifyMessage(message));

		return c.text("Message sent");
	},
);

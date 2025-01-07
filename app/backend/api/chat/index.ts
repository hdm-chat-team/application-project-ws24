import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { createRouter } from "#api/factory";
import { insertMessage, insertMessageSchema } from "#db/messages";
import { protectedRoute } from "#lib/middleware";
import { getServer } from "#lib/utils";
import { stringifyMessage } from "#shared/message";

export const chatRouter = createRouter().post(
	"/:id",
	zValidator("param", cuidParamSchema),
	zValidator("form", insertMessageSchema),
	protectedRoute,
	async (c) => {
		const message = c.req.valid("form");
		const { id: chatId } = c.req.valid("param");

		const [result] = await insertMessage.execute(message);
		getServer().publish(chatId, stringifyMessage(result));

		return c.text("Message sent");
	},
);

import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { createRouter } from "#api/factory";
import {
	deleteUserContact,
	insertUserContact,
	insertUserContactSchema,
	selectUserContactsByUserId,
} from "#db/users";
import { protectedRoute } from "#lib/middleware";

export const contactsRouter = createRouter()
	.get("/", protectedRoute, async (c) => {
		const { id: userId } = c.get("user");

		const contactIds = await selectUserContactsByUserId
			.execute({ userId })
			.catch((error) => {
				throw new HTTPException(500, {
					message: error.message,
					cause: error.cause,
				});
			})
			.then((rows) => rows.map(({ contactOf, ...userId }) => userId));

		return c.json({ data: contactIds });
	})
	.post(
		"/",
		protectedRoute,
		zValidator("json", insertUserContactSchema),
		async (c) => {
			const { id: contactorId } = c.get("user");
			const { contactId } = c.req.valid("json");

			const [newContact] = await insertUserContact
				.execute({ contactorId, contactId })
				.catch((error) => {
					throw new HTTPException(500, {
						message: error.message,
						cause: error.cause,
					});
				});

			return c.json(
				{
					message: "contact created",
					data: newContact,
				},
				201,
			);
		},
	)
	.delete(
		"/:id",
		protectedRoute,
		zValidator("param", cuidParamSchema),
		async (c) => {
			const contactorId = c.get("user").id;
			const contactId = c.req.valid("param").id;

			const [deletedContact] = await deleteUserContact
				.execute({ contactorId, contactId })
				.catch((error) => {
					throw new HTTPException(500, {
						message: error.message,
						cause: error.cause,
					});
				});

			return c.json({
				message: "contact deleted",
				data: deletedContact,
			});
		},
	);

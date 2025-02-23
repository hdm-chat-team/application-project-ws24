import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { createRouter } from "#api/factory";
import {
	type UserWithProfile,
	deleteUserContact,
	insertUserContact,
	insertUserContactSchema,
	selectUserById,
	selectUserContactsByUserId,
} from "#db/users";
import { protectedRoute } from "#lib/middleware";

export const contactsRouter = createRouter()
	.get("/", protectedRoute, async (c) => {
		const userId = c.var.user.id;

		const contactIds = await selectUserContactsByUserId
			.execute({ userId })
			.then((rows) => rows.map(({ contactOf, ...userId }) => userId));

		return c.json({ data: contactIds });
	})
	.post(
		"/",
		protectedRoute,
		zValidator("json", insertUserContactSchema.pick({ contactId: true })),
		async (c) => {
			const { id: contactorId } = c.get("user");
			const { contactId } = c.req.valid("json");

			const contact = await selectUserById.execute({
				id: contactId,
			});
			if (!contact) return c.json({ message: "contact not found" }, 404);

			await insertUserContact.execute({
				contactorId,
				contactId: contact.id,
			});

			return c.json(
				{
					message: "contact created",
					data: { contact: contact as UserWithProfile },
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

			const [deletedContact] = await deleteUserContact.execute({
				contactorId,
				contactId,
			});

			return c.json({
				message: "contact deleted",
				data: deletedContact,
			});
		},
	);

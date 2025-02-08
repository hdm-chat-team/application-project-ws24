import { cuidParamSchema } from "@application-project-ws24/cuid";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { DatabaseError } from "pg";
import { createRouter } from "#api/factory";
import {
	deleteContact,
	insertContact,
	insertContactSchema,
	selectContactsByUserId,
	selectUserContactByContactId,
} from "#db/contacts";
import { protectedRoute } from "#lib/middleware";

export const contactsRouter = createRouter()
	.get("/", protectedRoute, async (c) => {
		const { id: userId } = c.get("user");

		const contactIds = await selectContactsByUserId
			.execute({ userId })
			.catch((error: DatabaseError) => {
				throw new HTTPException(500, {
					message: error.message,
					cause: error.cause,
				});
			})
			.then((rows) => rows.map((row) => row.contactId));

		return c.json({ data: contactIds });
	})
	.post(
		"/",
		protectedRoute,
		zValidator("form", insertContactSchema.pick({ contactId: true })),
		async (c) => {
			const { id: userId } = c.get("user");
			const { contactId } = c.req.valid("form");

			const [newContact] = await insertContact
				.execute({ userId, contactId })
				.catch((error: DatabaseError) => {
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
	.get(
		"/:id",
		protectedRoute,
		zValidator("param", cuidParamSchema),
		async (c) => {
			const { id: contactId } = c.req.valid("param");
			const { id: userId } = c.get("user");

			const contactData = await selectUserContactByContactId
				.execute({ contactId, userId })
				.catch((error: DatabaseError) => {
					throw new HTTPException(500, {
						message: error.message,
						cause: error.cause,
					});
				})
				.then((row) => {
					if (!row?.contact) return null;
					const { profile, ...user } = row.contact;
					return { user, profile };
				});

			if (!contactData)
				throw new HTTPException(404, { message: "no contact found" });

			const { user, profile } = contactData;

			if (!profile)
				throw new HTTPException(404, { message: "no profile found" });

			return c.json({ data: { user, profile } });
		},
	)
	.delete(
		"/:id",
		protectedRoute,
		zValidator("param", cuidParamSchema),
		async (c) => {
			const { id: contactId } = c.req.valid("param");
			const { id: userId } = c.get("user");

			const [deletedContact] = await deleteContact
				.execute({ userId, contactId })
				.catch((error: DatabaseError) => {
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

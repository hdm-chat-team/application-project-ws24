import {cuidParamSchema} from "@application-project-ws24/cuid";
import {zValidator} from "@hono/zod-validator";
import {HTTPException} from "hono/http-exception";
import {createRouter} from "#api/factory";
import {addContact, removeContact, selectContactById, selectUserContacts,} from "#db/contact";
import {protectedRoute} from "#lib/middleware";
import {z} from "zod";
import {selectUserByEmail} from "#db/users";

const contactFormSchema = z.object({email: z.string().email()})
export const contactRouter = createRouter()
	.get("/", protectedRoute, async (c) => {
		const { id } = c.get("user");

		const contacts = await selectUserContacts(id);

		return c.json({ data: contacts });
	})

	.get(
		"/:id",
		protectedRoute,
		zValidator("param", cuidParamSchema),
		async (c) => {
			const { id: contactId } = c.req.valid("param");
			const { id: userId } = c.get("user");

			const contact = await selectContactById(userId, contactId);

			if (!contact) {
				throw new HTTPException(404, { message: "no contacts found" });
			}

			return c.json({ data: contact });
		},
	)

	.post("/",
		protectedRoute,
		zValidator("form", contactFormSchema),
		async (c) => {
		const { id } = c.get("user");
		const { email } = c.req.valid("form");


		const contact = await selectUserByEmail.execute({email})
			if (!contact) {
				throw new HTTPException(404, { message: `User with email ${email} not found` });
			}
		const newContact = await addContact(id, contact.id).catch((error) => {
			throw new HTTPException(400, { message: error.message });
		});

		return c.json({
			message: "contact created",
			data: newContact,
		});
	})

	.delete(
		"/:id",
		protectedRoute,
		zValidator("param", cuidParamSchema),
		async (c) => {
			const { id: contactId } = c.req.valid("param");
			const { id: userId } = c.get("user");

			const result = await removeContact(userId, contactId).catch((error) => {
				throw new HTTPException(400, { message: error.message });
			});

			return c.json({
				message: "contact deleted",
				data: result,
			});
		},
	);

contactRouter.get("/contacts", protectedRoute, async (c) => {
	const { id } = c.get("user");

	const contacts = await selectUserContacts(id);

	if (!contacts) {
		throw new HTTPException(404, { message: "contacts not found" });
	}

	return c.json({ data: contacts });
});

import {createRouter} from "#api/factory";
import {protectedRoute} from "#lib/middleware";
import {HTTPException} from "hono/http-exception";
import {zValidator} from "@hono/zod-validator";
import {cuidParamSchema} from "@application-project-ws24/cuid";
import {addContact, removeContact, selectContactById, selectUserContacts,} from "#db/contact";

export const contactRouter = createRouter()
    .get("/", protectedRoute, async (c) => {
        const { id } = c.get("user");

        const contacts = await selectUserContacts(id);

        if (!contacts || contacts.length === 0) {
            throw new HTTPException(404, { message: "no contacts found" });
        }

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
        }
    )

    .post("/", protectedRoute, async (c) => {
        const { id } = c.get("user");
        const { contactId } = await c.req.json();

        if (!contactId) {
            throw new HTTPException(400, { message: "contact id missing" });
        }

        const newContact = await addContact(id, contactId).catch((error) => {
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
        }
    );


contactRouter.get("/contacts", protectedRoute, async (c) => {
    const { id } = c.get("user");

    const contacts = await selectUserContacts(id);

    if (!contacts) {
        throw new HTTPException(404, { message: "contacts not found" });
    }

    return c.json({ data: contacts });
});

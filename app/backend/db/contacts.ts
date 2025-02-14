import { cuidSchema } from "@application-project-ws24/cuid";
import { and, eq, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { db } from "#db";
import { contactsTable } from "./users";

const insertContactSchema = createInsertSchema(contactsTable, {
	userId: cuidSchema,
	contactId: cuidSchema,
});
const selectContactSchema = createSelectSchema(contactsTable);
type Contact = z.infer<typeof selectContactSchema>;

const insertContact = db
	.insert(contactsTable)
	.values({
		userId: sql.placeholder("userId"),
		contactId: sql.placeholder("contactId"),
	})
	.returning()
	.prepare("insert_contact");

const selectContactsByUserId = db.query.contactsTable
	.findMany({
		where: eq(contactsTable.userId, sql.placeholder("userId")),
	})
	.prepare("select_contacts_by_user_id");

const selectUserContactByContactId = db.query.contactsTable
	.findFirst({
		with: {
			contact: { with: { profile: true } },
		},
		columns: {},
		where: eq(contactsTable.contactId, sql.placeholder("contactId")),
	})
	.prepare("select_user_contact_by_contact_id");

const deleteContact = db
	.delete(contactsTable)
	.where(
		and(
			eq(contactsTable.userId, sql.placeholder("userId")),
			eq(contactsTable.contactId, sql.placeholder("contactId")),
		),
	)
	.returning()
	.prepare("delete_contact");

export {
	// * Contact schemas
	insertContactSchema,
	selectContactSchema,
	// * Contact queries
	insertContact,
	deleteContact,
	selectContactsByUserId,
	selectUserContactByContactId,
};
export type { Contact };

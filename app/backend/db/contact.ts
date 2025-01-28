import {and, eq} from "drizzle-orm";
import {db} from "#db";
import {userProfileTable} from "#db/users.sql";
import {contactsTable, userTable} from "./users.ts";
import {z} from "zod";

const userContactType = z.object({
	id: z.string(), contactId: z.string(), avatarUrl: z.string().nullable(), displayName: z.string().nullable()
})
export type UserContact = z.infer<typeof userContactType>
const selectUserContacts = async (userId: string) => {
	return db
		.select({
			id: contactsTable.id,
			avatarUrl: userProfileTable.avatarUrl,
			displayName: userProfileTable.displayName,
			contactId: contactsTable.contactId
		})
		.from(userTable)
		.innerJoin(contactsTable, eq(contactsTable.contactId, userTable.id))
		.leftJoin(
			userProfileTable,
			eq(contactsTable.contactId, userProfileTable.userId),
		)
		.where(eq(contactsTable.userId, userId))
		.execute();
};

const selectContactById = async (userId: string, contactId: string) => {
	return db
		.select({
			id: userTable.id,
			avatarUrl: userTable.avatarUrl,
		})
		.from(userTable)
		.innerJoin(contactsTable, eq(contactsTable.contactId, userTable.id))
		.where(
			and(
				eq(contactsTable.userId, userId),
				eq(contactsTable.contactId, contactId),
			),
		)
		.execute();
};

const addContact = async (userId: string, contactId: string) => {
	return db.insert(contactsTable).values({ userId, contactId }).execute();
};

const removeContact = async (userId: string, contactId: string) => {
	return db
		.delete(contactsTable)
		.where(
			and(
				eq(contactsTable.userId, userId),
				eq(contactsTable.contactId, contactId),
			),
		);
};

export { selectUserContacts, selectContactById, addContact, removeContact };

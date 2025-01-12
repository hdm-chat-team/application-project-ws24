import {db} from "#db";
import {contactsTable, userTable} from "./users.ts";
import {and, eq} from "drizzle-orm";
import {userProfileTable} from "#db/users.sql";

const selectUserContacts = async (userId: string) => {
    return db
        .select({
            id: userTable.id,
            avatarUrl: userTable.avatarUrl,
            displayName: userProfileTable.displayName,
        })
        .from(userTable)
        .innerJoin(contactsTable, eq(contactsTable.contactId, userTable.id))
        .leftJoin(userProfileTable, eq(contactsTable.userId, userProfileTable.userId))
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
                eq(contactsTable.contactId, contactId)
            )
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
            and (
                eq(contactsTable.userId, userId),
                eq(contactsTable.contactId, contactId))
        )
};

export {
    selectUserContacts,
    selectContactById,
    addContact,
    removeContact,
}




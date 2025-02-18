import { relations } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { sessionTable } from "#db/sessions.sql";
import { chatMembershipTable } from "./chats.sql";
import { messageTable } from "./messages.sql";
import { cuid, id } from "./utils";

export const userTable = pgTable(
	"users",
	{
		id,
		createdAt: timestamp({ mode: "string" }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "string" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date().toISOString()),
		githubId: varchar({ length: 20 }).notNull().unique(),
		username: varchar({ length: 39 }).notNull().unique(),
		email: varchar({ length: 255 }).notNull().unique(),
	},
	(table) => [uniqueIndex().on(table.email, table.username)],
);

export const userTableRelations = relations(userTable, ({ one, many }) => ({
	profile: one(userProfileTable),
	sessions: many(sessionTable),
	contacts: many(userContactTable, { relationName: "contactor" }),
	contactOf: many(userContactTable, { relationName: "contact" }),
	chats: many(chatMembershipTable),
	messages: many(messageTable),
}));

export const userProfileTable = pgTable(
	"users_profiles",
	{
		id,
		userId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" })
			.unique(),
		displayName: varchar({ length: 255 }),
		avatarUrl: varchar({ length: 255 }),
		htmlUrl: varchar({ length: 255 }),
		createdAt: timestamp({ mode: "string" }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "string" })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date().toISOString()),
	},
	(table) => [index().on(table.displayName)],
);

export const userProfileTableRelations = relations(
	userProfileTable,
	({ one }) => ({
		owner: one(userTable, {
			fields: [userProfileTable.userId],
			references: [userTable.id],
		}),
	}),
);

export const userContactTable = pgTable(
	"users_contacts",
	{
		contactorId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		contactId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.contactorId, table.contactId] })],
);

export const userContactTableRelations = relations(
	userContactTable,
	({ one }) => ({
		contactor: one(userTable, {
			relationName: "contactor",
			fields: [userContactTable.contactorId],
			references: [userTable.id],
		}),
		contact: one(userTable, {
			relationName: "contact",
			fields: [userContactTable.contactId],
			references: [userTable.id],
		}),
	}),
);

import { createId, LENGTH } from "@application-project-ws24/cuid";
import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

const ID_SIZE_CONFIG = { length: LENGTH };

// * Common Fields
const id = varchar(ID_SIZE_CONFIG).primaryKey().$default(createId);

const createdAt = timestamp().notNull().defaultNow();
const updatedAt = timestamp();
const timestamps = { createdAt, updatedAt };

// * User
export const userTable = pgTable("users", {
	id,
	...timestamps,
	githubId: varchar({ length: 20 }).notNull().unique(),
	username: varchar({ length: 39 }).notNull().unique(),
	email: varchar({ length: 255 }).notNull().unique(),
});

export const userTableRelations = relations(userTable, ({ one, many }) => ({
	sessions: many(sessionTable),
	profile: one(userProfileTable, {
		fields: [userTable.id],
		references: [userProfileTable.userId],
		relationName: "profile",
	}),
}));

export const insertUserSchema = createInsertSchema(userTable, {
	email: z.string().email().min(1),
});
export const selectUserSchema = createSelectSchema(userTable, {
	email: z.string().email().min(1),
});
export type User = z.infer<typeof selectUserSchema>;

export const userProfileTable = pgTable("user_profiles", {
	id,
	...timestamps,
	userId: varchar(ID_SIZE_CONFIG)
		.notNull()
		.references(() => userTable.id),
	displayName: varchar({ length: 255 }),
	avatar_url: varchar({ length: 255 }),
	html_url: varchar({ length: 255 }),
});

export const userProfileTableRelations = relations(
	userProfileTable,
	({ one }) => ({
		owner: one(userTable, {
			fields: [userProfileTable.userId],
			references: [userTable.id],
		}),
	}),
);

export const insertUserProfileSchema = createInsertSchema(
	userProfileTable,
).omit({
	createdAt: true,
});
export const selectUserProfileSchema = createSelectSchema(userProfileTable);
export type UserProfile = z.infer<typeof selectUserProfileSchema>;

export const userContactTable = pgTable("user_contacts", {
	id,
	createdAt,
	userId: varchar(ID_SIZE_CONFIG)
		.notNull()
		.references(() => userTable.id),
	contactId: varchar(ID_SIZE_CONFIG)
		.notNull()
		.references(() => userTable.id),
});

export const userContactTableRelations = relations(
	userContactTable,
	({ one }) => ({
		user: one(userTable, {
			fields: [userContactTable.userId],
			references: [userTable.id],
		}),
		contact: one(userTable, {
			fields: [userContactTable.contactId],
			references: [userTable.id],
		}),
	}),
);

export const insertUserContactSchema = createInsertSchema(userContactTable);
export const selectUserContactSchema = createSelectSchema(userContactTable);
export type UserContact = z.infer<typeof selectUserContactSchema>;

// * Session
export const sessionTable = pgTable("sessions", {
	token: varchar({ length: 64 }).primaryKey(),
	userId: varchar(ID_SIZE_CONFIG)
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp({
		withTimezone: true,
	}).notNull(),
});

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [sessionTable.userId],
		references: [userTable.id],
	}),
}));

export const insertSessionSchema = createInsertSchema(sessionTable);
export const selectSessionSchema = createSelectSchema(sessionTable);
export type Session = z.infer<typeof selectSessionSchema>;

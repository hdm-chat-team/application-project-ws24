import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { userTable } from "./user.sql";
import { ID_SIZE_CONFIG } from "./utils";

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

import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./users.sql";
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

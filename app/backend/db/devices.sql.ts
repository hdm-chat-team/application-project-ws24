import { relations } from "drizzle-orm";
import { pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { userTable } from "./users.sql";
import { cuid } from "./utils";

export const deviceTable = pgTable("devices", {
	id: cuid().primaryKey(),
	userId: cuid()
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	addedAt: timestamp({ mode: "string" }).notNull().defaultNow(),
	lastSignedInAt: timestamp({ mode: "string" }).notNull().defaultNow(),
});

export const deviceTableRelations = relations(deviceTable, ({ one }) => ({
	owner: one(userTable, {
		fields: [deviceTable.userId],
		references: [userTable.id],
	}),
}));

export const deviceSyncTable = pgTable(
	"devices_sync",
	{
		deviceId: cuid()
			.notNull()
			.references(() => deviceTable.id, { onDelete: "cascade" }),
		userId: cuid()
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		lastSyncedAt: timestamp({ mode: "string" }).defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.deviceId, table.userId] })],
);

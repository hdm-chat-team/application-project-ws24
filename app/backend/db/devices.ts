import { sql } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { db } from "#db";
import { deviceSyncTable, deviceTable } from "./devices.sql";

export const selectDeviceSchema = createSelectSchema(deviceTable);
export type Device = z.infer<typeof selectDeviceSchema>;

export const upsertDevice = db
	.insert(deviceTable)
	.values({
		id: sql.placeholder("deviceId"),
		userId: sql.placeholder("userId"),
	})
	.onConflictDoUpdate({
		target: deviceTable.id,
		set: {
			lastSignedInAt: sql`now()`,
		},
	})
	.returning()
	.prepare("upsert_device");

export const upsertDeviceSync = db
	.insert(deviceSyncTable)
	.values({
		deviceId: sql.placeholder("deviceId"),
		userId: sql.placeholder("userId"),
	})
	.onConflictDoUpdate({
		target: [deviceSyncTable.deviceId, deviceSyncTable.userId],
		set: { lastSyncedAt: sql`now()` },
	})
	.prepare("upsert_device_sync");

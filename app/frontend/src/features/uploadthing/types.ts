import type { EntityTable } from "dexie";
import { z } from "zod";

export const localFileSchema = z.object({
	customId: z.string(),
	originalName: z.string(),
	type: z.string(),
	createdAt: z.date(),
	blob: z.instanceof(Blob),
});

export type LocalFile = z.infer<typeof localFileSchema>;

export type LocalFileTable = EntityTable<LocalFile, "customId">;

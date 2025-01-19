import type { ExtractTablesWithRelations } from "drizzle-orm";
import type {
	NodePgDatabase,
	NodePgTransaction,
} from "drizzle-orm/node-postgres";
import type { schema } from "#db";

type Schema = typeof schema;

type DB = NodePgDatabase<Schema>;

type Transaction = NodePgTransaction<
	Schema,
	ExtractTablesWithRelations<Schema>
>;

export type { DB, Transaction, Schema };

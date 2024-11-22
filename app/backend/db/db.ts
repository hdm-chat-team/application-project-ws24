import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.sql";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

const db = drizzle(DATABASE_URL, { schema });

export default db;

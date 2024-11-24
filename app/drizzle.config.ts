import { defineConfig } from "drizzle-kit";
import env from "#env";

export default defineConfig({
	out: "./drizzle",
	schema: "./backend/db/schema.sql.ts",
	dialect: "postgresql",
	casing: "snake_case",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});

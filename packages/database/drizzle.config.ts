import { defineConfig } from "drizzle-kit";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./src/schema.sql.ts",
	dialect: "postgresql",
	casing: "snake_case",
	dbCredentials: {
		url: DATABASE_URL,
	},
});

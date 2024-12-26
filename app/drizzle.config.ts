import { defineConfig } from "drizzle-kit";
import env from "#env";

export default defineConfig({
	out: "../drizzle",
	schema: "./backend/**/*.sql.ts", // ! All schema files end with .sql.ts
	dialect: "postgresql",
	casing: "snake_case",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});

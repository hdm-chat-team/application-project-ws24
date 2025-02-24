import { drizzle } from "drizzle-orm/bun-sql";
import { reset } from "drizzle-seed";
import { schema } from "#db";
import env from "#env";
import { userContactTable, userProfileTable, userTable } from "../users.sql";

// ? Should this require confirmation prompt?

console.log("🔄 Resetting the database...");

await reset(
	drizzle(env.DATABASE_URL, {
		schema,
		casing: "snake_case",
	}),
	{ userTable, userProfileTable, userContactTable },
).catch((error) => {
	console.log("❌ Reset failed:");
	console.error(error);
});

console.log("✅ Done!");

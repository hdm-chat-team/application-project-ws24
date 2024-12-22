import { drizzle } from "drizzle-orm/node-postgres";
import env from "#env";
import * as chatSchema from "./chats.sql";
import * as sessionSchema from "./sessions.sql";
import * as userSchema from "./users.sql";

const db = drizzle(env.DATABASE_URL, {
	schema: { ...userSchema, ...sessionSchema, ...chatSchema },
	casing: "snake_case",
});

export default db;
export { db };

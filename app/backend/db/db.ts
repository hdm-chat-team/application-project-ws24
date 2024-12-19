import { drizzle } from "drizzle-orm/node-postgres";
import env from "#env";
import * as userSchema from "./schema/user.sql";
import * as sessionSchema from "./schema/session.sql";
import * as chatSchema from "./schema/chat.sql";

const db = drizzle(env.DATABASE_URL, {
	schema: { ...userSchema, ...sessionSchema, ...chatSchema },
	casing: "snake_case",
});

export default db;

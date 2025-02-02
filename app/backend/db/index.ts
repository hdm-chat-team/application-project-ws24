import { drizzle } from "drizzle-orm/node-postgres";
import env from "#env";
import * as messageAttachmentSchema from "./attachments.sql";
import * as chatSchema from "./chats.sql";
import * as messageSchema from "./messages.sql";
import * as sessionSchema from "./sessions.sql";
import * as userSchema from "./users.sql";

const schema = {
	...userSchema,
	...sessionSchema,
	...chatSchema,
	...messageSchema,
	...messageAttachmentSchema,
};

const db = drizzle(env.DATABASE_URL, {
	schema,
	casing: "snake_case",
});

export default db;
export { db, schema };

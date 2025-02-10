import { LENGTH, createId } from "@application-project-ws24/cuid";
import { timestamp, varchar } from "drizzle-orm/pg-core";

// * CUID column type
const cuid = () => varchar({ length: LENGTH });

// * Common Fields
const id = cuid().primaryKey().$default(createId);

const createdAt = timestamp({ mode: "string" }).notNull().defaultNow();
const updatedAt = timestamp({ mode: "string" })
	.notNull()
	.$onUpdate(() => new Date().toISOString());

const timestamps = { createdAt, updatedAt };

export { id, cuid, createdAt, updatedAt, timestamps };

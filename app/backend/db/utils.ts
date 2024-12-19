import { LENGTH, createId } from "@application-project-ws24/cuid";
import { timestamp, varchar } from "drizzle-orm/pg-core";

const ID_SIZE_CONFIG = { length: LENGTH };

// * Common Fields

const id = varchar(ID_SIZE_CONFIG).primaryKey().$default(createId);

const createdAt = timestamp().notNull().defaultNow();
const updatedAt = timestamp();
const timestamps = { createdAt, updatedAt };

export { id, ID_SIZE_CONFIG, createdAt, updatedAt, timestamps };

import { LENGTH, createId } from "@application-project-ws24/cuid";
import { varchar } from "drizzle-orm/pg-core";

// * CUID column type
export const cuid = () => varchar({ length: LENGTH });

// * Common Fields
export const id = cuid().primaryKey().$default(createId);

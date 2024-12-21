import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { chatTable } from "./chats.sql";

const insertChatSchema = createInsertSchema(chatTable);
const selectChatSchema = createSelectSchema(chatTable);
type Chat = z.infer<typeof selectChatSchema>;

export {
	// * Chat schemas
	insertChatSchema,
	selectChatSchema,
};
export type { Chat };

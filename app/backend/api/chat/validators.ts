import { cuidSchema } from "@application-project-ws24/cuid";
import { z } from "zod";
import {
	insertChatMemberSchema,
	insertChatSchema,
	updateChatSchema,
} from "#db/chats";

/**
 * Schema for creating different types of chats.
 * Discriminated union based on chat type with specific validation rules:
 *
 * - Self chat:
 *   - No name
 *   - Exactly 1 member
 *
 * - Direct chat:
 *   - No name
 *   - Exactly 2 members
 *
 * - Group chat:
 *   - name required
 *   - Minimum of 2 members
 *
 * @see insertChatSchema - Base schema this extends from
 * @see chatTypeSchema - Enum defining valid chat types
 * @see insertChatMemberSchema - Schema for chat members
 */
export const createChatSchema = z.discriminatedUnion("type", [
	insertChatSchema.extend({
		type: z.literal(insertChatSchema.shape.type.enum.self),
		name: z.null(),
		members: z
			.array(insertChatMemberSchema.shape.userId)
			.length(1, "Self chat must have one member."),
	}),
	insertChatSchema.extend({
		type: z.literal(insertChatSchema.shape.type.enum.direct),
		name: z.null(),
		members: z
			.array(insertChatMemberSchema.shape.userId)
			.length(2, "Direct chat must have two members."),
	}),
	insertChatSchema.extend({
		type: z.literal(insertChatSchema.shape.type.enum.group),
		name: z.string().nonempty("Group chat must have a name"),
		members: z
			.array(insertChatMemberSchema.shape.userId)
			.min(2, "Group chat must have at least two members."),
	}),
]);

export const updateChatNameFormSchema = updateChatSchema.extend({
	id: cuidSchema,
	type: z.literal(insertChatSchema.shape.type.enum.group),
});

export type CreateChat = z.infer<typeof createChatSchema>;

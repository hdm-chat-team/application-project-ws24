import { relations } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	primaryKey,
	varchar,
} from "drizzle-orm/pg-core";
import { userTable } from "./users.sql";
import { ID_SIZE_CONFIG, id, timestamps } from "./utils";

export const chatTypeEnum = pgEnum("chatType", ["self", "direct", "group"]);
export type ChatEnum = (typeof chatTypeEnum.enumValues)[number];

export const chatTable = pgTable("chats", {
	id,
	...timestamps,
	name: varchar({ length: 255 }),
	type: chatTypeEnum().notNull(),
});

export const chatRelations = relations(chatTable, ({ many }) => ({
	members: many(chatMemberTable),
}));

export const chatMemberTable = pgTable(
	"chat_members",
	{
		chatId: varchar(ID_SIZE_CONFIG)
			.notNull()
			.references(() => chatTable.id, { onDelete: "cascade" }),
		userId: varchar(ID_SIZE_CONFIG)
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
	},
	(table) => [
		{
			pk: primaryKey({ columns: [table.chatId, table.userId] }),
			chatMemberIdIndex: index().on(table.userId),
		},
	],
);

export const chatMemberRelations = relations(chatMemberTable, ({ one }) => ({
	chat: one(chatTable, {
		fields: [chatMemberTable.chatId],
		references: [chatTable.id],
	}),
	user: one(userTable, {
		fields: [chatMemberTable.userId],
		references: [userTable.id],
	}),
}));

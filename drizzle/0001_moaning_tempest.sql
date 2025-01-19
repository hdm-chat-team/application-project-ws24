CREATE TYPE "public"."status" AS ENUM('sent', 'delivered', 'read');--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"chat_id" varchar(15),
	"author_id" varchar(15),
	"status" "status" DEFAULT 'sent' NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
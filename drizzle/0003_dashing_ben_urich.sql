CREATE TYPE "public"."chatType" AS ENUM('self', 'contact', 'group');--> statement-breakpoint
CREATE TABLE "contacts" (
	"user_id" varchar(15) NOT NULL,
	"contact_id" varchar(15) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "chat_type" "chatType" NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" varchar;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_contact_id_users_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
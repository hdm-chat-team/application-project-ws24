CREATE TYPE "public"."chat_membership_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."chat_type" AS ENUM('self', 'direct', 'group');--> statement-breakpoint
CREATE TYPE "public"."messages_state" AS ENUM('pending', 'sent', 'delivered', 'read');--> statement-breakpoint
CREATE TABLE "messages_attachments" (
	"url" varchar(255) PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"message_id" varchar(15) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats_memberships" (
	"user_id" varchar(15) NOT NULL,
	"chat_id" varchar(15) NOT NULL,
	"role" "chat_membership_role" NOT NULL,
	"joined_at" timestamp NOT NULL,
	CONSTRAINT "chats_memberships_user_id_chat_id_pk" PRIMARY KEY("user_id","chat_id")
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"avatar_url" varchar(255),
	"type" "chat_type" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices_sync" (
	"device_id" varchar(15) NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "devices_sync_device_id_user_id_pk" PRIMARY KEY("device_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages_recipients" (
	"message_id" varchar(15) NOT NULL,
	"recipient_id" varchar(15) NOT NULL,
	"state" "messages_state" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "messages_recipients_message_id_recipient_id_pk" PRIMARY KEY("message_id","recipient_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"chat_id" varchar(15) NOT NULL,
	"author_id" varchar(15) NOT NULL,
	"state" "messages_state" NOT NULL,
	"body" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_sessions" (
	"token" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"device_id" varchar(15) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_contacts" (
	"contactor_id" varchar(15) NOT NULL,
	"contact_id" varchar(15) NOT NULL,
	CONSTRAINT "users_contacts_contactor_id_contact_id_pk" PRIMARY KEY("contactor_id","contact_id")
);
--> statement-breakpoint
CREATE TABLE "users_profiles" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"display_name" varchar(255),
	"avatar_url" varchar(255),
	"html_url" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_profiles_userId_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"github_id" varchar(20) NOT NULL,
	"username" varchar(39) NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "users_githubId_unique" UNIQUE("github_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "messages_attachments" ADD CONSTRAINT "messages_attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats_memberships" ADD CONSTRAINT "chats_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats_memberships" ADD CONSTRAINT "chats_memberships_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices_sync" ADD CONSTRAINT "devices_sync_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices_sync" ADD CONSTRAINT "devices_sync_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages_recipients" ADD CONSTRAINT "messages_recipients_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages_recipients" ADD CONSTRAINT "messages_recipients_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_contacts" ADD CONSTRAINT "users_contacts_contactor_id_users_id_fk" FOREIGN KEY ("contactor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_contacts" ADD CONSTRAINT "users_contacts_contact_id_users_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_profiles" ADD CONSTRAINT "users_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "messages_recipients_message_id_index" ON "messages_recipients" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "messages_author_id_index" ON "messages" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "messages_created_at_index" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_sessions_user_id_index" ON "users_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_profiles_display_name_index" ON "users_profiles" USING btree ("display_name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_username_index" ON "users" USING btree ("email","username");
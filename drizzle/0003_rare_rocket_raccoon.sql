CREATE TABLE "message_attachments" (
	"url" varchar(255) PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"message_id" varchar(15) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "has_file" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
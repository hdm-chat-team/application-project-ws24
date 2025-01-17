import { attachmentTable } from "./attachments.sql";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

const insertAttachmentSchema = createInsertSchema(attachmentTable);
const selectAttachmentSchema = createSelectSchema(attachmentTable);
type Attachment = z.infer<typeof selectAttachmentSchema>;

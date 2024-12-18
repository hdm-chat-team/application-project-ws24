import { cuidSchema } from "@application-project-ws24/cuid";
import { z } from "zod";

export const cuidParamSchema = z.object({
	topic: cuidSchema,
});

export const messageFormSchema = z.object({
	content: z.string().min(1),
});

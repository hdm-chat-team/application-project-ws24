import { z } from "zod";

export const signoutQuerySchema = z.object({
	from: z.string().url().nullable(),
});

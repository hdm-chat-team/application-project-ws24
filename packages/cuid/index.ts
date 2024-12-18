import { init, isCuid } from "@paralleldrive/cuid2";
import { z } from "zod";

const length = 15;

const createId = init({
	length,
	fingerprint: "Hello from our project team! Here is a cookie for you: 🍪",
});

const cuidSchema = z
	.string({ message: "CUIDs are strings" })
	.length(length, { message: `CUIDs need to have a length of ${length}` })
	.refine(isCuid, "Invalid CUID");

const cuidParamSchema = z.object({
	id: cuidSchema,
});

export { createId, isCuid, length, cuidSchema, cuidParamSchema };

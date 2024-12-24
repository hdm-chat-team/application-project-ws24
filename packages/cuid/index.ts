import { init } from "@paralleldrive/cuid2";
import { z } from "zod";

const length = 15;

const createId = init({
	length,
	fingerprint: "Hello from our project team! Here is a cookie for you: 🍪",
});

const cuidSchema = z
	.string({ message: "CUIDs are strings" })
	.cuid2()
	.length(length, { message: `CUIDs need to have a length of ${length}` });

const cuidParamSchema = z.object({
	id: cuidSchema,
});

export {
	// * Constants
	length as LENGTH,
	// * Validators
	cuidSchema,
	cuidParamSchema,
	// * Functions
	createId,
};

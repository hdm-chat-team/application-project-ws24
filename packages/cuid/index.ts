import { init } from "@paralleldrive/cuid2";

export const length = 15;

export const createId = init({
	length,
	fingerprint: "Hello from our project team! Here is a cookie for you: 🍪",
});

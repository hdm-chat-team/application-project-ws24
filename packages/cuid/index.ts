import { init, isCuid } from "@paralleldrive/cuid2";

const length = 15;

const createId = init({
	length,
	fingerprint: "Hello from our project team! Here is a cookie for you: 🍪",
});

export { length, createId, isCuid };

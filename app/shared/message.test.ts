import { describe, expect, test } from "bun:test";
import { createId, cuidSchema } from "@application-project-ws24/cuid";
import {
	type Message,
	createMessage,
	messageFormSchema,
	messageSchema,
	parseMessage,
	stringifyMessage,
} from "./message";

describe("Message module", () => {
	describe("createMessage", () => {
		test("creates valid message", () => {
			const chatId = createId();
			const authorId = createId();
			const body = "Hello, world!";

			const message = createMessage(chatId, authorId, body);

			expect(cuidSchema.safeParse(message.authorId).success).toBeTrue();
			expect(cuidSchema.safeParse(message.id).success).toBeTrue();
			expect(message.body).toBe(body);
			expect(message.createdAt).toBeInstanceOf(Date);
		});
	});

	describe("messageSchema", () => {
		test("validates correct message", () => {
			const validMessage: Message = {
				id: createId(),
				chatId: createId(),
				authorId: createId(),
				body: "Test message",
				createdAt: new Date(),
			};

			const result = messageSchema.safeParse(validMessage);
			expect(result.success).toBe(true);
		});

		test("rejects invalid message", () => {
			const invalidMessage = {
				id: createId(),
				authorId: createId(),
				body: "", // empty body should fail
				createdAt: new Date(),
			};

			const result = messageSchema.safeParse(invalidMessage);
			expect(result.success).toBe(false);
			expect(result.error).toBeTruthy();
		});
	});

	describe("messageFormSchema", () => {
		test("only includes body field", () => {
			const validForm = { body: "Test message" };
			const result = messageFormSchema.safeParse(validForm);
			expect(result.success).toBe(true);
		});
	});

	describe("serialization", () => {
		test("stringifyMessage and parseMessage roundtrip", () => {
			const authorId = createId();
			const chatId = createId();
			const originalMessage = createMessage(chatId, authorId, "Test message");
			const stringified = stringifyMessage(originalMessage);
			const parsed = parseMessage(stringified);

			expect(parsed).toEqual(originalMessage);
		});

		describe("parseMessage", () => {
			test("throws on invalid JSON", () => {
				expect(() => parseMessage("invalid json")).toThrow();
			});

			test("throws on invalid message structure", () => {
				const invalidJson = JSON.stringify({
					id: createId(),
					body: "",
					createdAt: new Date().toISOString(),
				});

				expect(() => parseMessage(invalidJson)).toThrow();
			});
		});
	});
});

import { describe, expect, test } from "bun:test";
import { EnvSchema } from "./env";

describe("env", () => {
	test("valid environment variables", () => {
		const validEnv = {
			NODE_ENV: "development",
			PORT: "3000",
			DATABASE_URL: "postgresql://localhost:5432/db",
			CLIENT_ID_GITHUB: "client-id",
			CLIENT_SECRET_GITHUB: "client-secret",
			CALLBACK_URL_GITHUB: "https://example.com/callback",
			UPLOADTHING_TOKEN: "uploadthing-token",
			UPLOADTHING_SECRET: "uploadthing-secret",
		};

		const result = EnvSchema.safeParse(validEnv);
		expect(result.success).toBe(true);
	});
});

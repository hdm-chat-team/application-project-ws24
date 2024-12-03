import { z } from "zod";

const nodeEnvironments = ["development", "production", "test"] as const;

export const EnvSchema = z.object({
	// * General
	NODE_ENV: z.enum(nodeEnvironments).default("development"),
	PORT: z
		.unknown()
		.transform((value) => Number(value))
		.default(3000),

	// * PostgreSQL
	DATABASE_URL: z
		.string()
		.url("Must be a valid URL")
		.startsWith("postgresql://", "Must be a PostgreSQL URL"),

	// * GitHub OAuth
	CLIENT_ID_GITHUB: z.string().min(1),
	CLIENT_SECRET_GITHUB: z.string().min(1),
	CALLBACK_URL_GITHUB: z.string().min(1).url(),
});

type NodeEnv = z.infer<typeof EnvSchema>;

const { data, error } = EnvSchema.safeParse(process.env);

if (error) {
	console.error("❌ Invalid Environment Variables:");
	console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
	process.exit(1);
}

const env: NodeEnv = data;
export default env;

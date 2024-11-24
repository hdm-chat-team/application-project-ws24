import {
	url,
	nonEmpty,
	object,
	optional,
	parse,
	picklist,
	pipe,
	startsWith,
	string,
	transform,
	unknown,
} from "valibot";
import type { InferOutput } from "valibot";

const nodeEnvironments = ["development", "production", "test"] as const;

export const EnvSchema = object({
	// * General
	NODE_ENV: optional(pipe(string(), picklist(nodeEnvironments)), "development"),
	PORT: optional(
		pipe(
			unknown(),
			transform((value) => Number(value)),
		),
		3000,
	),

	// * PostgreSQL
	DATABASE_URL: pipe(string(), startsWith("postgresql://")),

	// * GitHub OAuth
	CLIENT_ID_GITHUB: pipe(string(), nonEmpty()),
	CLIENT_SECRET_GITHUB: pipe(string(), nonEmpty()),
	CALLBACK_URL_GITHUB: pipe(string(), nonEmpty(), url()),
});

type NodeEnv = InferOutput<typeof EnvSchema>;

let env: NodeEnv;

try {
	env = parse(EnvSchema, process.env);
} catch (error) {
	console.error("❌ Invalid environment variables: \n", error);
	process.exit(1);
}

export default env;

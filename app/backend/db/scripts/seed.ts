import { createId } from "@application-project-ws24/cuid";
import { drizzle } from "drizzle-orm/bun-sql";
import { seed } from "drizzle-seed";
import { schema } from "#db";
import env from "#env";

/* 
* Number of users to seed
? should this be a command line argument? 
*/
const USER_COUNT = 1000;

// * Tables to seed
const { userTable, userProfileTable } = schema;

console.log("🌱 Seeding the database...");

try {
	const GITHUB_ID_RANGE = {
		start: 10000000,
		end: 99999999,
	};
	await seed(
		// Bun SQL instance for performance (~10.5s -> ~0.5s)
		drizzle(env.DATABASE_URL, {
			schema,
			casing: "snake_case",
		}),
		{
			userTable,
			userProfileTable,
		},
	).refine((generators) => ({
		userTable: {
			count: USER_COUNT,
			columns: {
				id: generators.valuesFromArray({
					values: Array.from({ length: USER_COUNT }, () => createId()),
					isUnique: true,
				}),
				githubId: generators.int({
					minValue: GITHUB_ID_RANGE.start,
					maxValue: GITHUB_ID_RANGE.end,
					isUnique: true,
				}),
				username: generators.fullName(),
				email: generators.email(),
			},
			with: {
				userProfileTable: 1,
			},
		},
		userProfileTable: {
			count: 0,
			columns: {
				id: generators.valuesFromArray({
					values: Array.from({ length: USER_COUNT }, () => createId()),
					isUnique: true,
				}),
				avatarUrl: generators.valuesFromArray({
					values: Array.from({ length: USER_COUNT }, () => {
						// random github avatar urls, might be fun to see...
						const githubUserId =
							Math.floor(
								Math.random() *
									(GITHUB_ID_RANGE.end - GITHUB_ID_RANGE.start + 1),
							) + GITHUB_ID_RANGE.start;

						return `https://avatars.githubusercontent.com/u/${githubUserId}`;
					}),
				}),
			},
		},
	}));
} catch (error) {
	console.log("❌ Seeding failed:");
	console.error(error);
}

console.log("✅ Done!");

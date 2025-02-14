import { createId } from "@application-project-ws24/cuid";
import { seed } from "drizzle-seed";
import { db } from "#db";
import { userTable } from "../users.sql";

// run with "bun db:seed" in app folder
async function main() {
	try {
		const userIdPool = Array.from({ length: 1000 }, () => createId());

		await seed(db, { userTable }).refine((f) => ({
			userTable: {
				count: 1000,
				columns: {
					id: f.valuesFromArray({ values: userIdPool, isUnique: true }),
					githubId: f.int({
						minValue: 10000000,
						maxValue: 99999999,
						isUnique: true,
					}),
					username: f.fullName(),
					email: f.email(),
				},
			},
		}));

		console.log("Successfully seeded users");
	} catch (error) {
		console.error("Seeding failed", error);
	}
}

main();

import { createId } from "@application-project-ws24/cuid";
import { faker } from "@faker-js/faker/locale/de";
import { db } from "#db";
import { userTable } from "../users.sql";

const userIdPool = Array.from({ length: 1000 }, () => createId());

try {
	await db.insert(userTable).values(
		userIdPool.map((id) => ({
			id,
			githubId: Math.floor(100000000 + Math.random() * 900000000).toString(),
			username: faker.person.fullName().replace(/\s+/g, "").toLowerCase(),
			email: faker.internet.email().toLowerCase(),
		})),
	);
	console.log("Successfully seeded users");
} catch (error) {
	console.error("Seeding failed", error);
}
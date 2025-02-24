import type { UserWithProfile } from "@server/db/users";

type Relation = "contact" | "stranger";
export type LocalUser = UserWithProfile & { relation: Relation };

import { db } from "@/lib/db";
import type { UserContact } from "@server/db/users";
import { useMutation } from "@tanstack/react-query";

export function useSaveContacts() {
	return useMutation({
		mutationKey: ["db/save-contacts"],
		mutationFn: async (contacts: UserContact[]) => {
			await db.userContacts.bulkAdd(contacts);
		},
	});
}

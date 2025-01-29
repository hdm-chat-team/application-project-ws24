import { db } from "@/lib/db.ts";
import type { UserContact } from "@server/db/contact.ts";
import { useMutation } from "@tanstack/react-query";

export function useSaveContacts() {
	return useMutation({
		mutationKey: ["db/save-contacts"],
		mutationFn: async (contacts: UserContact[]) => {
			await db.contacts.bulkPut(contacts);
		},
	});
}

import { db } from "@/lib/db";
import type { Contact } from "@server/db/contacts";
import { useMutation } from "@tanstack/react-query";

export function useSaveContacts() {
	return useMutation({
		mutationKey: ["db/save-contacts"],
		mutationFn: async (contacts: UserContact[]) => {
			await db.contacts.bulkPut(contacts);
		},
	});
}

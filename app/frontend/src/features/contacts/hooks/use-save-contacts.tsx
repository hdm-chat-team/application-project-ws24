import {useMutation} from "@tanstack/react-query";
import type {Contacts} from "@server/db/contact.ts";
import {db} from "@/lib/db.ts";

export function useSaveContacts() {
    return useMutation({
        mutationKey: ["db/save-contacts"],
        mutationFn: async (contacts: Contacts[]) => {
            await db.contacts.bulkPut(contacts);
        },
    });
}

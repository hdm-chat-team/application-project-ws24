import {useQueryClient} from "@tanstack/react-query";
import {syncContactsQueryOptions} from "@/features/contacts/queries.ts";
import {useSaveContacts} from "@/features/contacts/hooks/use-save-contacts.tsx";
import {useCallback} from "react";

export function useContacts(){
    // const { user } = useUser();
    const saveContacts = useSaveContacts().mutate
    const queryClient = useQueryClient();
    const loadContacts = useCallback(async () => {
        console.log('Load contacts')
        const contacts = await queryClient.fetchQuery(syncContactsQueryOptions);
        saveContacts(contacts)
    }, []);
    return {
        loadContacts,
    }
}
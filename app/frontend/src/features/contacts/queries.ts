import api from "@/lib/api";
import { db } from "@/lib/db";
import { queryOptions } from "@tanstack/react-query";

export const contactsQueryFn = () =>
	db.userContacts
		.toArray()
		.then((contacts) => contacts.map((contact) => contact.contactId));

export const syncContactsQueryOptions = queryOptions({
	queryKey: ["GET", api.user.contacts.$url().pathname],
	queryFn: async () => {
		const response = await api.user.contacts.$get();
		if (!response.ok) throw new Error("Failed to fetch contacts");

		return (await response.json()).data;
	},
});

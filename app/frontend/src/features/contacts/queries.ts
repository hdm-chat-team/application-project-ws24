import api from "@/lib/api";
import { db } from "@/lib/db";
import { queryOptions } from "@tanstack/react-query";

export const contactsByUserId = (userId: string) =>
	db.contacts.where("userId").equals(userId).toArray();

export const syncContactsQueryOptions = queryOptions({
	queryKey: [api.contact.$url().pathname],
	queryFn: async () => {
		const response = await api.contact.$get();
		if (!response.ok) throw new Error("Failed to fetch contacts");

		return (await response.json()).data;
	},
});

import api from "@/lib/api";
import { db } from "@/lib/db";
import type { UserWithProfile } from "@server/db/users";
import { type UserSearchQuery, userSearchQuerySchema } from "@shared/types";
import { queryOptions } from "@tanstack/react-query";

export const contactsQueryFn = () =>
	db.users.where("relation").equals("contact").toArray();

export const syncContactsQueryOptions = queryOptions({
	queryKey: ["GET", api.user.contacts.$url().pathname],
	queryFn: async () => {
		const response = await api.user.contacts.$get();
		if (!response.ok) throw new Error("Failed to fetch contacts");

		return (await response.json()).data;
	},
});

export const searchUsersQueryOptions = (query: UserSearchQuery) =>
	queryOptions<UserWithProfile[]>({
		queryKey: ["GET", api.user.search.$url().pathname, query.search],
		queryFn: async () => {
			const { error } = userSearchQuerySchema.safeParse(query);
			if (error) return [];
			const localResults = await userSearchQueryFn(query);

			if (localResults.length > 0) return localResults;

			const response = await api.user.search.$get({ query });

			return (await response.json()).data;
		},
	});

export const userSearchQueryFn = ({ search }: UserSearchQuery) =>
	db.users
		.where("username")
		.equalsIgnoreCase(search)
		.or("email")
		.equalsIgnoreCase(search)
		.toArray();

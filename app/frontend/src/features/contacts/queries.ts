import api from "@/lib/api";
import { db } from "@/lib/db";
import type { UserWithProfile } from "@server/db/users";
import type { UserSearchQuery } from "@shared/types";
import { queryOptions } from "@tanstack/react-query";

export const contactsQueryFn = () =>
	db.users.where("relation").equals("contact").sortBy("profile.displayName");

export const searchUsersQueryOptions = (query: UserSearchQuery) =>
	queryOptions<UserWithProfile[]>({
		queryKey: ["GET", api.user.search.$url().pathname, query.search],
		queryFn: async () => {
			if (!query.search) return [];
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

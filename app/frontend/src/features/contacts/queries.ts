import api from "@/lib/api";
import { db } from "@/lib/db";
import type { UserWithProfile } from "@server/db/users";
import type { UserSearchQuery } from "@shared/types";
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

export const searchUsersQueryOptions = (query: UserSearchQuery) => {
	return queryOptions<UserWithProfile[]>({
		queryKey: ["GET", api.user.search.$url().pathname, query.search],
		queryFn: async () => {
			const localResults = await userSearchQueryFn(query);

			if (localResults.length > 0) return localResults;

			const response = await api.user.search.$get({ query });

			return (await response.json()).data;
		},
	});
};

export const userSearchQueryFn = ({ search }: UserSearchQuery) =>
	db.transaction("r", db.users, db.userProfiles, async () => {
		const users = await db.users
			.where("username")
			.equalsIgnoreCase(search)
			.or("email")
			.equalsIgnoreCase(search)
			.toArray();

		const profiles = await db.userProfiles
			.where("userId")
			.anyOf(users.map((user) => user.id))
			.toArray();

		// add the profile to the corresponding user
		const usersWithProfiles: UserWithProfile[] = [];
		for (const user of users) {
			const profile = profiles.find((profile) => profile.userId === user.id);
			if (!profile) continue;
			usersWithProfiles.push({ ...user, profile });
		}

		return usersWithProfiles;
	});

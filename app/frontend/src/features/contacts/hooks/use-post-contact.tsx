import api from "@/lib/api";
import db from "@/lib/db";
import { useMutation } from "@tanstack/react-query";

export const usePostContact = () =>
	useMutation({
		mutationKey: ["POST", api.user.contacts.$url().pathname],
		mutationFn: async (contactId: string) => {
			const result = await api.user.contacts.$post({
				json: {
					contactId,
				},
			});

			if (!result.ok) throw new Error("Failed to create contact");
			return (await result.json()).data;
		},
		onSuccess: async ({ contact }) => {
			await db.users.put({ ...contact, relation: "contact" });
		},
	});

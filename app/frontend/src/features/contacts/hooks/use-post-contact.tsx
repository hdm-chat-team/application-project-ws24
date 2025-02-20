import { useUser } from "@/features/auth/hooks";
import api from "@/lib/api";
import db from "@/lib/db";
import { useMutation } from "@tanstack/react-query";

export function usePostContact() {
	const { user } = useUser();
	return useMutation({
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
		onMutate: (contactId) => {
			db.userContacts.add({
				contactorId: user.id,
				contactId,
			});
		},
		onError: (_error, contactId) => {
			db.userContacts.delete({
				contactorId: user.id,
				contactId,
			});
		},
	});
}

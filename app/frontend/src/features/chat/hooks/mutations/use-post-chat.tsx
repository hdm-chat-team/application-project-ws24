import {useUser} from "@/features/auth/hooks";
import {useMutation} from "@tanstack/react-query";
import api from "@/lib/api.ts";

export function usePostChatMutation() {
    const { user } = useUser();
    const mutationKey = [api.chat.$url().pathname];
    return useMutation({
        mutationKey,
        mutationFn: async (userIds: string[]) => {
            if (!user) return;

            const result = await api.chat.$post({
                form: {
                    userIds
                },
            });
            if (!result.ok) {
                throw new Error("Failed to create chat");
            } else {
                return result.json();
            }
        },
    })
}


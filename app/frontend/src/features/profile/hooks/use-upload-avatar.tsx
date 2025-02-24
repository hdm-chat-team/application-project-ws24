import { authQueryOptions } from "@/features/auth/queries";
import { useUploadThing } from "@/features/uploadthing/hooks";
import { saveFile } from "@/features/uploadthing/mutations";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUploadUserAvatar() {
	const queryClient = useQueryClient();
	const { startUpload } = useUploadThing(
		(routeRegistry) => routeRegistry.avatar,
	);
	return useMutation({
		mutationKey: ["api/uploadthing/avatar"],
		mutationFn: async ([file]: File[]) => {
			const [result] = (await startUpload([file])) ?? [];

			if (!result?.customId) {
				throw new Error("Upload failed");
			}

			await saveFile(file, result.customId);
			return result;
		},
		onMutate: async ([variables]) => {
			await queryClient.cancelQueries(authQueryOptions);
			const previousUserData = queryClient.getQueryData(
				authQueryOptions.queryKey,
			);
			if (!previousUserData) throw new Error("No previous data found");
			const objectUrl = URL.createObjectURL(variables);
			queryClient.setQueryData(
				authQueryOptions.queryKey,
				(data) =>
					data && {
						user: data.user,
						profile: {
							...data.profile,
							avatarUrl: objectUrl,
						},
					},
			);
			return { previousUserData, objectUrl };
		},
		onError: (_error, _variables, context) => {
			if (context) {
				queryClient.setQueryData(
					authQueryOptions.queryKey,
					context.previousUserData,
				);
			}
		},
		onSettled: (_data, _error, _variables, context) => {
			if (context?.objectUrl) {
				URL.revokeObjectURL(context.objectUrl);
			}
			queryClient.invalidateQueries(authQueryOptions);
		},
	});
}

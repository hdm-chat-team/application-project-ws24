import { ProfileCard } from "@/features/profile/components";
import {
	ProfileEmptyState,
	ProfileErrorState,
	ProfileLoadingState,
} from "@/features/profile/components";
import { userProfileQueryOptions } from "@/features/profile/queries";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/user/$userId")({
	loader: async ({ context: { queryClient }, params: { userId } }) => {
		const profile = await queryClient.ensureQueryData(
			userProfileQueryOptions(userId),
		);
		if (!profile) throw notFound();
		return profile;
	},
	component: UserProfilePage,
	errorComponent: (error) => ProfileErrorState(error),
	notFoundComponent: ProfileEmptyState,
});

function UserProfilePage() {
	const profile = Route.useLoaderData();

	return !profile ? <ProfileLoadingState /> : <ProfileCard {...profile} />;
}

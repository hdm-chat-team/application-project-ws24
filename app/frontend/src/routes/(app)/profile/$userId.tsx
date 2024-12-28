import TopNav from "@/components/nav/top-nav";
import { ProfileCard } from "@/components/profile/profile-card";
import {
	ProfileEmptyState,
	ProfileErrorState,
	ProfileLoadingState,
} from "@/components/profile/profile-states";
import { userProfileQueryOptions } from "@/features/profile/queries";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/profile/$userId")({
	loader: ({ context: { queryClient }, params: { userId } }) => {
		return queryClient
			.ensureQueryData(userProfileQueryOptions(userId))
			.catch((error: Error) => {
				console.error("Failed to load profile:", error);
			});
	},
	component: UserProfilePage,
});

function UserProfilePage() {
	const { userId } = Route.useParams();
	const { data, isLoading, error } = useQuery(userProfileQueryOptions(userId));

	// Loading states
	if (isLoading) return <ProfileLoadingState />;
	if (error) return <ProfileErrorState error={error as Error} />;
	if (!data) return <ProfileEmptyState />;

	return (
		<div>
			<TopNav />
			<main className="container mx-auto max-w-3xl p-4">
				<ProfileCard profile={data.data} isOwnProfile={false} />
			</main>
		</div>
	);
}

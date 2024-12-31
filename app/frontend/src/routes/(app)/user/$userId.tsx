import TopNav from "@/components/nav/top-nav";
import { ProfileCard } from "@/features/profile/components/profile-card";
import {
	ProfileEmptyState,
	ProfileErrorState,
	ProfileLoadingState,
} from "@/features/profile/components/profile-states";
import { userProfileQueryOptions } from "@/features/profile/queries";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/user/$userId")({
	loader: async ({ context: { queryClient }, params: { userId } }) => {
		try {
			return await queryClient.ensureQueryData(userProfileQueryOptions(userId));
		} catch (error) {
			console.error("Failed to load profile:", error);
		}
	},
	component: UserProfilePage,
});

function UserProfilePage() {
	const { userId } = Route.useParams();
	const { data, isLoading, error } = useQuery(userProfileQueryOptions(userId));

	// Loading states
	if (isLoading) return <ProfileLoadingState />;
	if (error) return <ProfileErrorState error={new Error(error.message)} />;
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

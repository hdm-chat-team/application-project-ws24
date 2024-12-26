import TopNav from "@/components/nav/top-nav";
import { ProfileCard } from "@/components/profile/ProfileCard";
import {
	ProfileEmptyState,
	ProfileErrorState,
	ProfileLoadingState,
} from "@/components/profile/ProfileStates";
import {
	useUserProfile,
	userProfileQueryOptions,
} from "@/features/profile/queries";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(users)/profile/$userId")({
	loader: ({ context: { queryClient }, params: { userId } }) => {
		return queryClient
			.ensureQueryData(userProfileQueryOptions(userId))
			.catch((error) => {
				console.error("Failed to load profile:", error);
			});
	},
	component: UserProfilePage,
});

function UserProfilePage() {
	const { userId } = Route.useParams();
	const { data: response, isLoading, error } = useUserProfile(userId);
	const profile = response?.data;

	// Loading states
	if (isLoading) return <ProfileLoadingState />;
	if (error) return <ProfileErrorState error={error} />;
	if (!profile) return <ProfileEmptyState />;

	return (
		<div>
			<TopNav />
			<main className="container mx-auto max-w-3xl p-4">
				<ProfileCard profile={profile} isOwnProfile={false} />
			</main>
		</div>
	);
}

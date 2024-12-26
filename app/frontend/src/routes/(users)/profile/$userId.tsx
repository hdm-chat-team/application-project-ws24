import TopNav from "@/components/nav/top-nav";
import { ProfileCard } from "@/components/profile/ProfileCard";
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
	if (isLoading) return <div>Loading Profile...</div>;
	if (error) return <div>Failed to load profile: {error.message}</div>;
	if (!profile) return <div>No profile found</div>;

	return (
		<div>
			<TopNav />
			<main>
				<ProfileCard profile={profile} isOwnProfile={false} />
			</main>
		</div>
	);
}

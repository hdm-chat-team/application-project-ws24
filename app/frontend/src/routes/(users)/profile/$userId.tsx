import TopNav from "@/components/nav/top-nav";
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
		<div className="min-h-screen bg-background">
			<TopNav />

			<main className="container mx-auto p-6">
				<div className="space-y-6">
					<h1>User Profile</h1>

					<div className="space-y-4">
						{profile.avatarUrl && (
							<img
								src={profile.avatarUrl}
								alt={profile.displayName || "Profile picture"}
								className="h-24 w-24 rounded-full object-cover"
							/>
						)}

						<div className="space-y-2">
							<p className="text-lg">Display name: {profile.displayName}</p>

							{profile.htmlUrl && (
								<a
									href={profile.htmlUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline"
								>
									View on GitHub
								</a>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
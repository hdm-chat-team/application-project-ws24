import { createFileRoute } from "@tanstack/react-router";
import { useUserProfile } from "@/features/profile/queries";

export const Route = createFileRoute("/(users)/profile/$userId")({
	component: UserProfilePage,
});

function UserProfilePage() {
	const { userId } = Route.useParams() as { userId: string };
	const { data: profile, isLoading, error } = useUserProfile(userId);

	if (isLoading) return <div>Loading Profile...</div>;
	if (error) return <div>Failed to load profile: {error.message}</div>;
	if (!profile) return <div>No profile found</div>;

	return (
		<div>
			<h1>User Profile</h1>
			<div>
				{profile.avatar_url && (
					<img
						src={profile.avatar_url}
						alt={profile.displayName || "Profile picture"}
					/>
				)}
				<div>
					<p>Display name: {profile.displayName}</p>
				</div>
			</div>
		</div>
	);
}

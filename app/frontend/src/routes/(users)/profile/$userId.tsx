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
	const { userId } = Route.useParams() as { userId: string };
	const { data: profile, isLoading, error } = useUserProfile(userId);

	console.log("Route Params:", { userId });
	console.log("API Response:", { profile, isLoading, error });

	if (isLoading) return <div>Loading Profile...</div>;
	if (error) return <div>Failed to load profile: {error.message}</div>;
	if (!profile) return <div>No profile found</div>;

	return (
		<div>
			<h1>User Profile</h1>
			<div>
				{profile.avatarUrl && (
					<img
						src={profile.avatarUrl}
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

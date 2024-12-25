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

	console.log("Trying to load profile for:", {
		requestedUserId: userId,
	});

	const { data: response, isLoading, error } = useUserProfile(userId);

	const profile = response?.data;

	console.log("Loaded profile:", {
		response,
		profile,
	});

	if (isLoading) return <div>Loading Profile...</div>;
	if (error) return <div>Failed to load profile: {error.message}</div>;
	if (!profile) return <div>No profile found</div>;

	return (
		<div>
			<h1>User Profile</h1>
			{profile.avatarUrl && (
				<img
					src={profile.avatarUrl}
					alt={profile.displayName || "Profile picture"}
				/>
			)}
			<p>Display name: {profile.displayName}</p>
			{profile.htmlUrl && (
				<a href={profile.htmlUrl} target="_blank" rel="noopener noreferrer">
					View on GitHub
				</a>
			)}
		</div>
	);
}

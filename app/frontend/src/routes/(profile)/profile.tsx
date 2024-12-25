import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	profileQueryOptions,
	useProfile,
	useUpdateProfile,
} from "../../features/profile/queries";
import TopNav from "@/components/nav/top-nav";

// TODO: add a profile image editing / upload ( maybe a feature request for the future)

export const Route = createFileRoute("/(profile)/profile")({
	loader: ({ context: { queryClient } }) => {
		return queryClient.ensureQueryData(profileQueryOptions).catch((error) => {
			console.error("Failed to load profile:", error);
		});
	},
	component: ProfilePage,
});

function ProfilePage() {
	const [isEditing, setIsEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const [showSuccess, setShowSuccess] = useState(false);
	const { data: profile, isLoading, error } = useProfile();
	const updateProfile = useUpdateProfile();

	if (isLoading) return <div>Loading Profile...</div>;
	if (error) return <div>Failed to load profile: {error.message}</div>;
	if (!profile) return <div>No profile found</div>;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = newDisplayName.trim();

		if (trimmedName.length < 2) {
			alert("Name should be at least 2 characters long");
			return;
		}
		updateProfile.mutate(trimmedName, {
			onSuccess: () => {
				setIsEditing(false);
				setNewDisplayName("");
				setShowSuccess(true);
				setTimeout(() => {
					setShowSuccess(false);
				}, 3000);
			},
			onError: (error) => {
				console.error("Error updating profile:", error);
			},
		});
	};
	return (
		<div>
			<TopNav />
			<h1>Profile</h1>
			{showSuccess && <div> ✅Profile updated successfully✅ </div>}
			<div>
				{profile.avatarUrl && (
					<img
						src={profile.avatarUrl}
						alt={profile.displayName || "Profile image"}
					/>
				)}
				<div>
					{isEditing ? (
						<form onSubmit={handleSubmit}>
							<div>
								<label>
									Display name:
									<input
										type="text"
										value={newDisplayName}
										onChange={(e) => setNewDisplayName(e.target.value)}
										required
										minLength={2}
									/>
								</label>
							</div>
							<div>
								<button type="submit" disabled={updateProfile.isPending}>
									{updateProfile.isPending ? "Saving..." : "Save"}
								</button>
								<button type="button" onClick={() => setIsEditing(false)}>
									Cancel
								</button>
							</div>
						</form>
					) : (
						<>
							<p>Display name: {profile.displayName}</p>
							{profile.htmlUrl && (
								<a
									href={profile.htmlUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									View on GitHub
								</a>
							)}
							<button
								type="button"
								onClick={() => {
									setNewDisplayName(profile.displayName || "");
									setIsEditing(true);
								}}
							>
								Edit profile
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

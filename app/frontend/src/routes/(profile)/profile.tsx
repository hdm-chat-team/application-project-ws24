import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile, useUpdateProfile } from "../../features/profile/queries";

// TODO: maybe split into more components like a ProfileForm component

export const Route = createFileRoute("/(profile)/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const [isEditing, setIsEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const { data: profile, isLoading, error } = useProfile();
	const updateProfile = useUpdateProfile();
	if (isLoading) return <div>Loading Profile...</div>;
	if (error) return <div>Failed to load profile: {error.message}</div>;
	if (!profile) return <div>No profile found</div>;
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (newDisplayName.trim()) {
			updateProfile.mutate(newDisplayName, {
				onSuccess: () => {
					setIsEditing(false);
					setNewDisplayName("");
				},
				onError: (error) => {
					console.error("Error updating profile:", error);
				},
			});
		}
	};
	return (
		<div>
			<h1>Profile</h1>
			<div>
				{profile.avatar_url && (
					<img
						src={profile.avatar_url}
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

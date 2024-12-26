import TopNav from "@/components/nav/top-nav";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	profileQueryOptions,
	useProfile,
	useUpdateProfile,
} from "../../features/profile/queries";

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
	const [showSuccess, setShowSuccess] = useState(false);
	const { data: profile, isLoading, error } = useProfile();
	const updateProfile = useUpdateProfile();

	if (isLoading) return <div>Loading Profile...</div>;
	if (error) return <div>Failed to load profile: {error.message}</div>;
	if (!profile) return <div>No profile found</div>;

	const handleSubmit = (newDisplayName: string) => {
		if (newDisplayName.length < 2) {
			alert("Name should be at least 2 characters long");
			return;
		}

		updateProfile.mutate(newDisplayName, {
			onSuccess: () => {
				setIsEditing(false);
				setShowSuccess(true);
				setTimeout(() => setShowSuccess(false), 3000);
			},
			onError: (error) => {
				console.error("Error updating profile:", error);
			},
		});
	};
	return (
		<div>
			<TopNav />
			<main>
				{showSuccess && (
					<div>
						<p>
							<span>✓</span>
							Profile updated successfully
						</p>
					</div>
				)}

				<ProfileCard
					profile={profile}
					isOwnProfile={true}
					onEdit={() => setIsEditing(true)}
				/>

				{isEditing && (
					<EditProfileForm
						initialName={profile.displayName || ""}
						onSubmit={handleSubmit}
						onCancel={() => setIsEditing(false)}
						isLoading={updateProfile.isPending}
					/>
				)}
			</main>
		</div>
	);
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile, useUpdateProfile } from "../../features/profile/queries";

export const Route = createFileRoute("/(profile)/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const [isEditing, setIsEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const { data: profile, isLoading, error } = useProfile();
	const updateProfile = useUpdateProfile();
	if (isLoading) return <div>Laden...</div>;
	if (error) return <div>Fehler: {error.message}</div>;
	if (!profile) return <div>Kein Profil gefunden</div>;
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (newDisplayName.trim()) {
			updateProfile.mutate(newDisplayName, {
				onSuccess: () => {
					setIsEditing(false);
					setNewDisplayName("");
				},
			});
		}
	};
	return (
		<div>
			<h1>Profil</h1>
			<div>
				{profile.avatar_url && (
					<img
						src={profile.avatar_url}
						alt={profile.displayName || "Profilbild"}
					/>
				)}
				<div>
					{isEditing ? (
						<form onSubmit={handleSubmit}>
							<div>
								<label>
									Anzeigename:
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
									{updateProfile.isPending ? "Speichern..." : "Speichern"}
								</button>
								<button type="button" onClick={() => setIsEditing(false)}>
									Abbrechen
								</button>
							</div>
						</form>
					) : (
						<>
							<p>Anzeigename: {profile.displayName}</p>
							<button
								type="button"
								onClick={() => {
									setNewDisplayName(profile.displayName || "");
									setIsEditing(true);
								}}
							>
								Profil bearbeiten
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

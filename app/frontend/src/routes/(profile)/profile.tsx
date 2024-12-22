import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface Profile {
	displayName: string;
	avatar_url: string;
}

function useProfile() {
	return useQuery<Profile>({
		queryKey: ["profile"],
		queryFn: async () => {
			const res = await fetch("/api/me/me", {
				credentials: "include",
			});
			if (!res.ok) {
				throw new Error("Failed to fetch profile");
			}
			return res.json();
		},
	});
}

export const Route = createFileRoute("/(profile)/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const [isEditing, setIsEditing] = useState(false);
	const [newDisplayName, setNewDisplayName] = useState("");
	const { data: profile, isLoading, error } = useProfile();
	const queryClient = useQueryClient();
	const updateProfile = useMutation({
		mutationFn: async (newName: string) => {
			try {
				const formData = new FormData();
				formData.append("displayName", newName);
				formData.append("avatar_url", profile?.avatar_url ?? "");

				const res = await fetch("/api/me/me", {
					method: "PUT",
					credentials: "include",
					body: formData,
				});

				if (!res.ok) {
					const errorData = await res.json();
					throw new Error(errorData.message || "Failed to update profile");
				}

				return res.json();
			} catch (error) {
				console.error("Profile update error:", error);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"] });
			setIsEditing(false);
			setNewDisplayName("");
		},
		onError: (error) => {
			console.error("Failed to update profile:", error);
		},
	});
	if (isLoading) return <div>Laden...</div>;
	if (error) return <div>Fehler: {error.message}</div>;
	if (!profile) return <div>Kein Profil gefunden</div>;
	return (
		<div>
			<h1>Profil</h1>
			<div>
				{profile.avatar_url && (
					<img src={profile.avatar_url} alt={profile.displayName} />
				)}
				<div>
					{isEditing ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								if (newDisplayName.trim()) {
									updateProfile.mutate(newDisplayName);
								}
							}}
						>
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
									setNewDisplayName(profile.displayName);
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

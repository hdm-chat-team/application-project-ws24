import { User } from "lucide-react";

// * Ensure type safety
type ProfileCardProps = {
	profile: {
		avatarUrl?: string | null;
		displayName?: string | null;
		htmlUrl?: string | null;
	};
	isOwnProfile?: boolean;
	onEdit?: () => void;
};

export function ProfileCard({
	profile,
	isOwnProfile = false,
	onEdit,
}: ProfileCardProps) {
	return (
		<div>
			<div>
				<div>
					{profile.avatarUrl ? (
						<img
							src={profile.avatarUrl}
							alt={profile.displayName || "Profile"}
						/>
					) : (
						<div>
							<User />
						</div>
					)}

					<div>
						<h2>{profile.displayName || "No display name set"}</h2>
						{profile.htmlUrl && (
							<a
								href={profile.htmlUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								View GitHub Profile
							</a>
						)}
					</div>

					{isOwnProfile && onEdit && (
						<button type="button" onClick={onEdit}>
							Edit Profile
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

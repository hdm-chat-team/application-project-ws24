import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { UserProfile } from "@server/db/users";
import { User } from "lucide-react";

// * Ensure type safety

export function ProfileCard(profile: UserProfile) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>Users profile information</CardDescription>
			</CardHeader>

			<CardContent>
				<div className="flex items-center space-x-4">
					{profile.avatarUrl ? (
						<img
							src={profile.avatarUrl}
							alt={profile.displayName || "Profile"}
							className="h-16 w-16 rounded-full object-cover"
						/>
					) : (
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
							<User className="h-8 w-8 text-muted-foreground" />
						</div>
					)}

					<div className="space-y-1.5">
						<h2 className="font-semibold text-xl">
							{profile.displayName || "No display name set"}
						</h2>
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
				</div>
			</CardContent>
		</Card>
	);
}

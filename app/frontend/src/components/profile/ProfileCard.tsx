import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>
					{isOwnProfile
						? "Your profile information"
						: "Users profile information"}
				</CardDescription>
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

				{isOwnProfile && onEdit && (
					<>
						<Separator className="my-4" />
						<div className="flex justify-end">
							<Button onClick={onEdit} variant="outline" size="sm">
								Edit Profile
							</Button>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

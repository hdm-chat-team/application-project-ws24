import TopNav from "@/components/nav/top-nav";
import { Card } from "@/components/ui/card";

function DefaultLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col">
			<TopNav />
			<main className="container mx-auto max-w-3xl p-4">{children}</main>
		</div>
	);
}

// * Loading State
export function ProfileLoadingState() {
	return (
		<DefaultLayout>
			<Card>
				<div className="flex items-center space-x-2 text-muted-foreground">
					<div className="animate-spin">⏳</div>
					<div>Loading profile information...</div>
				</div>
			</Card>
		</DefaultLayout>
	);
}

// * Failed to load State
export function ProfileErrorState({ error }: { error: Error }) {
	return (
		<DefaultLayout>
			<Card>
				<div className="flex items-center space-x-2 text-destructive">
					<span>❌</span>
					<div>Failed to load profile: {error.message}</div>
				</div>
			</Card>
		</DefaultLayout>
	);
}

// * No profile found State
export function ProfileEmptyState() {
	return (
		<DefaultLayout>
			<Card>
				<div className="flex items-center space-x-2 text-muted-foreground">
					<span>🔍</span>
					<div>No profile found</div>
				</div>
			</Card>
		</DefaultLayout>
	);
}

// * Invalid User State
export function InvalidUserState() {
	return (
		<DefaultLayout>
			<Card>
				<div className="flex items-center space-x-2 text-destructive">
					<span>⚠️</span>
					<div>This user does not exist or the user ID is invalid.</div>
				</div>
			</Card>
		</DefaultLayout>
	);
}

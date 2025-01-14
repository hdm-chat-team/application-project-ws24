import TopNav from "@/components/nav/top-nav";
import { EditProfileForm } from "@/features/profile/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/_authenticated/user")({
	component: ProfilePage,
});

function ProfilePage() {
	return (
		<div>
			<TopNav />
			<EditProfileForm />
		</div>
	);
}

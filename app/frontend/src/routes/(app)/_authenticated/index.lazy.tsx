import TopNav from "@/components/nav/top-nav";
import { useUser } from "@/features/auth/hooks";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/(app)/_authenticated/")({
	component: Index,
});

function Index() {
	const { user, profile } = useUser();
	return (
		<div>
			<TopNav />
			<pre>{JSON.stringify({ user, profile }, null, 2)}</pre>
			<div className="flex h-screen" />
		</div>
	);
}

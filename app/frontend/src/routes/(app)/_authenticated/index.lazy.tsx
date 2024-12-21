import TopNav from "@/components/nav/top-nav";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/(app)/_authenticated/")({
	component: Index,
});

function Index() {
	return (
		<div>
			<TopNav />
			<div className="flex h-screen" />
		</div>
	);
}

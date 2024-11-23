import { Button } from "@/components/ui/button";
/* import api from "@/lib/api"; */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Button asChild>
			<a href="/api/auth/github">Login!</a>
		</Button>
	);
}

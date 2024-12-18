import { authQueryOptions } from "@/features/auth";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

// * Layout for authenticated routes
export const Route = createFileRoute("/(app)/_authenticated")({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.fetchQuery({
			...authQueryOptions,
			staleTime: Number.POSITIVE_INFINITY,
		});
		if (!user) {
			throw redirect({ to: "/signin", search: { from: location.href } });
		}
	},
	component: () => <Outlet />,
});

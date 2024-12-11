import { authQueryOptions } from "@/features/auth/queries";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

// * Layout for authenticated routes
export const Route = createFileRoute("/(app)/_authenticated")({
	beforeLoad: async ({ context }) => {
		const { queryClient } = context;
		const auth = await queryClient.fetchQuery({
			...authQueryOptions,
			staleTime: Number.POSITIVE_INFINITY,
		});
		if (!auth) {
			throw redirect({ to: "/signin" });
		}
	},
	component: () => <Outlet />,
});

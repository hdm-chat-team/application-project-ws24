import { SocketProvider } from "@/context";
import { authQueryOptions } from "@/features/auth";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

// * Layout for authenticated routes
export const Route = createFileRoute("/(app)/_authenticated")({
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.fetchQuery(authQueryOptions);
		if (!user) {
			throw redirect({ to: "/signin", search: { from: location.href } });
		}
	},
	component: () => (
		<SocketProvider>
			<Outlet />
		</SocketProvider>
	),
});

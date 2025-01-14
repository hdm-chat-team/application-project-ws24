import { SocketProvider } from "@/context";
import { authQueryOptions } from "@/features/auth/queries";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Toaster } from "sonner";

// * Layout for authenticated routes
export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context: { queryClient } }) => {
		if (!(await queryClient.fetchQuery(authQueryOptions)))
			throw redirect({ to: "/signin", search: { from: location.href } });
	},
	component: () => (
		<SocketProvider>
			<Outlet />
			<Toaster closeButton richColors />
		</SocketProvider>
	),
});

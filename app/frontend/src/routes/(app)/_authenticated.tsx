import { SocketProvider } from "@/context";
import { authQueryOptions } from "@/features/auth";
import { userChatsQueryOptions } from "@/features/chat/queries";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Toaster } from "sonner";

// * Layout for authenticated routes
export const Route = createFileRoute("/(app)/_authenticated")({
	beforeLoad: async ({ context: { queryClient } }) => {
		if (!(await queryClient.fetchQuery(authQueryOptions)))
			throw redirect({ to: "/signin", search: { from: location.href } });
	},
	loader: async ({ context: { queryClient } }) => {
		queryClient.fetchQuery(userChatsQueryOptions);
	},
	component: () => (
		<SocketProvider>
			<Outlet />
			<Toaster closeButton richColors />
		</SocketProvider>
	),
});

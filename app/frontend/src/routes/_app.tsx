import {
	Sidebar,
	SidebarInset,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { SocketProvider } from "@/context";
import { authQueryOptions } from "@/features/auth/queries";
import { Chat, ChatHeader } from "@/features/chat/components";
import { ChatProvider } from "@/features/chat/context";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context: { queryClient } }) => {
		if (!(await queryClient.fetchQuery(authQueryOptions)))
			throw redirect({ to: "/signin", search: { from: location.href } });
	},
	component: () => (
		<SocketProvider>
			<SidebarProvider className="absolute top-0 left-0 h-full min-h-full">
				<ChatProvider>
					<Sidebar>
						{/* Sidebar content defined by routes */}
						<Outlet />
					</Sidebar>
					<SidebarInset className="flex flex-col">
						<ChatHeader />
						<main className="flex w-full flex-1 overflow-hidden">
							<Chat />
						</main>
					</SidebarInset>
				</ChatProvider>
			</SidebarProvider>
		</SocketProvider>
	),
});

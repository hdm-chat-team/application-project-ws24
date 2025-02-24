import TopNav from "@/components/nav/top-nav";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarFooter,
	SidebarInset,
	SidebarProvider,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { SocketProvider } from "@/context";
import { authQueryOptions } from "@/features/auth/queries";
import { Chat } from "@/features/chat/components";
import { ChatProvider } from "@/features/chat/context";
import handleMessage from "@/features/realtime/event-handler";
import WebSocketService from "@/features/realtime/ws-service";
import {
	Link,
	Outlet,
	createFileRoute,
	redirect,
} from "@tanstack/react-router";
import { MessageSquarePlusIcon } from "lucide-react";

const ws = new WebSocketService(handleMessage);

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context: { queryClient } }) => {
		if (!(await queryClient.fetchQuery(authQueryOptions)))
			throw redirect({ to: "/signin", search: { from: location.href } });
	},
	component: () => (
		<SocketProvider ws={ws}>
			<SidebarProvider className="absolute top-0 left-0 h-full min-h-full">
				<ChatProvider>
					<Sidebar>
						<TopNav />
						<SidebarSeparator className="mx-0" />
						{/* Sidebar content defined by routes */}
						<Outlet />
						<SidebarFooter>
							<Button asChild>
								<Link to="/new">
									<MessageSquarePlusIcon />
								</Link>
							</Button>
						</SidebarFooter>
					</Sidebar>
					<SidebarInset className="flex flex-col">
						<main className="flex w-full flex-1 overflow-hidden">
							<Chat />
						</main>
					</SidebarInset>
				</ChatProvider>
			</SidebarProvider>
		</SocketProvider>
	),
});

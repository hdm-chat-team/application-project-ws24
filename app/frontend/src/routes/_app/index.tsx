import { Button } from "@/components/ui/button";
import {
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";

import { useChat } from "@/features/chat/context";
import { chatsQueryFn } from "@/features/chat/queries";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { MessageSquarePlusIcon } from "lucide-react";

export const Route = createFileRoute("/_app/")({
	component: () => <ChatListSidebar />,
});

function ChatListSidebar() {
	const chats = useLiveQuery(chatsQueryFn, []);
	const { chat: currentChat, setChatId } = useChat();

	/* 
	 TODO: create proper chat list item component with avatar, name, last message, etc.
	 TODO: add sorting by last message time
	 TODO: add unread message count badge
	 TODO: add sorting chips (all, unread)
	 TODO: add searchbar
	*/
	return (
		<>
			<SidebarHeader className="flex flex-row items-center justify-between">
				Chats
				<Button variant="ghost" size="icon" asChild>
					<Link to="/contacts">
						<MessageSquarePlusIcon />
					</Link>
				</Button>
			</SidebarHeader>
			<SidebarSeparator className="mx-0" />
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{chats?.map(({ id, name }) => (
							<SidebarMenuItem key={id}>
								<div className="flex">
									<SidebarMenuButton
										value={id}
										onClick={(event) => setChatId(event.currentTarget.value)}
										isActive={id === currentChat?.id}
									>
										{name}
									</SidebarMenuButton>
								</div>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</>
	);
}

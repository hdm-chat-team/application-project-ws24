import ChatListItem from "@/components/sidebar/chat-list-item";
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
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";

export const Route = createFileRoute("/_app/")({
	component: () => <ChatListSidebar />,
});

function ChatListSidebar() {
	const chats = useLiveQuery(chatsQueryFn, []);
	const { chat: currentChat, setChatId } = useChat();

	/* 
	 Done: create proper chat list item component with avatar, name, last message, etc.
	 TODO: add sorting by last message time
	 TODO: add unread message count badge
	 TODO: add sorting chips (all, unread)
	 TODO: add searchbar
	*/
	return (
		<>
			<SidebarHeader className="flex justify-center">Chats</SidebarHeader>
			<SidebarSeparator className="mx-0" />
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{chats?.map(({ id, name, updatedAt }) => (
							<SidebarMenuItem key={id}>
								<div className="flex ">
									<SidebarMenuButton
										value={id}
										onClick={(event) => setChatId(event.currentTarget.value)}
										isActive={id === currentChat?.id}
										className="border border-slate-200 rounded-md py-6"
									>
										<ChatListItem
											name={name || ""}
											id="1"
											lastMessage="Hello their"
											onClick={() => console.log("hello")}
											avatar="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmStm5d-komRukWTSOYWnVAhDo5i2PbrBhIA&s"
											lastMessageTime={updatedAt}
											// allRead={false}
										/>
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

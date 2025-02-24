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
import { useState } from "react";

import Chip from "@/components/chips/chips";
import { useChat } from "@/features/chat/context";
import { chatsQueryFn } from "@/features/chat/queries";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Search, SearchCheckIcon } from "lucide-react";

type Chat = {
	id: string;
	name: string | null;
	createdAt: string;
	updatedAt: string;
	unreadCount?: number;
	isFavorite?: boolean;
	isGroup?: boolean;
};

export const Route = createFileRoute("/_app/")({
	component: () => <ChatListSidebar />,
});

function ChatListSidebar() {
	const chats = useLiveQuery<Chat[]>(chatsQueryFn, []);
	const { chat: currentChat, setChatId } = useChat();

	const [searchTerm, setSearchTerm] = useState("");
	const [filter, setFilter] = useState<"all" | "unread" | "favorite" | "group">(
		"all",
	);

	const searchedChats = (chats ?? []).filter((chat) => {
		const lowerSearch = searchTerm.toLowerCase();
		const lowerName = (chat.name ?? "").toLowerCase();
		return lowerName.includes(lowerSearch);
	});

	const filteredChats = searchedChats.filter((chat) => {
		switch (filter) {
			case "unread":
				return chat.unreadCount && chat.unreadCount > 0;
			case "favorite":
				return chat.isFavorite === true;
			case "group":
				return chat.isGroup === true;
			default:
				return true;
		}
	});

	filteredChats.sort((a, b) => {
		return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
	});
	const filters = [
		{ label: "All", value: "all" },
		{ label: "Unread", value: "unread" },
		{ label: "Favorite", value: "favorite" },
		{ label: "Group", value: "group" },
	];

	return (
		<>
			<SidebarHeader className="flex justify-center">Chats</SidebarHeader>
			<SidebarSeparator className="mx-0" />

			<div className="my-4 px-2 py-2">
				<div className="flex items-center rounded-full border bg-white px-3 py-2">
					<Search className="mx-2" />
					<input
						type="text"
						placeholder="Suchen"
						className="w-full bg-transparent focus:outline-none"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			<div className="flex flex-wrap gap-2 px-2 pb-2">
				{filters.map(({ label, value }) => (
					<Chip
						key={value}
						label={label}
						active={filter === value}
						onClick={() =>
							setFilter(value as "all" | "unread" | "favorite" | "group")
						}
					/>
				))}
			</div>

			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{filteredChats.map(({ id, name, updatedAt }) => (
							<SidebarMenuItem key={id}>
								<div className="flex ">
									<SidebarMenuButton
										value={id}
										onClick={(event) => setChatId(event.currentTarget.value)}
										isActive={id === currentChat?.id}
										className="rounded-md border border-slate-200 py-6"
									>
										<ChatListItem
											name={name || ""}
											id="1"
											lastMessage="Hello their"
											onClick={() => console.log("hello")}
											avatar="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmStm5d-komRukWTSOYWnVAhDo5i2PbrBhIA&s"
											lastMessageTime={updatedAt}
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

export default ChatListSidebar;

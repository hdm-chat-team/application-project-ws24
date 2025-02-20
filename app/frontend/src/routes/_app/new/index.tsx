import {
	SidebarContent,
	SidebarHeader,
	SidebarInput,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";

import { useChat } from "@/features/chat/context";
import { selfChatQueryFn } from "@/features/chat/queries";
import {
	contactsQueryFn,
	searchUsersQueryOptions,
} from "@/features/contacts/queries";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

export const Route = createFileRoute("/_app/new/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { setChatId } = useChat();
	const navigate = useNavigate();

	const selfChat = useLiveQuery(selfChatQueryFn, []);
	const contactIds = useLiveQuery(contactsQueryFn, []);
	const [searchTerm, setSearchTerm] = useState("");
	const search = useDebounce(searchTerm, 500);

	const { data } = useQuery(searchUsersQueryOptions({ search }));

	return (
		<>
			<SidebarHeader className="flex flex-row items-center justify-between">
				New Chat
			</SidebarHeader>
			<SidebarSeparator className="mx-0" />
			<SidebarContent className="my-2 space-y-1">
				<SidebarInput
					type="text"
					placeholder="Search"
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
				/>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Link to="/new/group/members">New Group</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				{data && (
					<SidebarMenu id="search-results">
						{data.map(({ username, profile: { displayName } }) => (
							<SidebarMenuItem key={username}>
								<SidebarMenuButton>{displayName}</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				)}
				{selfChat && (
					<SidebarMenu id="self">
						<SidebarMenuItem>
							<SidebarMenuButton
								value={selfChat.id}
								onClick={(event) => {
									setChatId(event.currentTarget.value);
									navigate({ to: "/" });
								}}
							>
								Me
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				)}
				{contactIds && (
					<SidebarMenu id="contacts">
						{contactIds.map((contact) => (
							<SidebarMenuItem key={contact}>
								<SidebarMenuButton>{contact}</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				)}
			</SidebarContent>
		</>
	);
}

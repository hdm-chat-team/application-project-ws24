import {
	SidebarContent,
	SidebarHeader,
	SidebarInput,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { useUser } from "@/features/auth/hooks";

import { useChat } from "@/features/chat/context";
import {
	directChatByMemberIdQueryFn,
	selfChatQueryFn,
} from "@/features/chat/queries";
import { createChat } from "@/features/chat/utils";
import { usePostContact } from "@/features/contacts/hooks/use-post-contact";
import {
	contactsQueryFn,
	searchUsersQueryOptions,
} from "@/features/contacts/queries";
import type { LocalUser } from "@/features/contacts/types";
import db from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";

export const Route = createFileRoute("/_app/new/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { setChatId } = useChat();
	const navigate = useNavigate();

	const selfChat = useLiveQuery(selfChatQueryFn, []);
	const contacts = useLiveQuery(contactsQueryFn, []);
	const [searchTerm, setSearchTerm] = useState("");
	const [search] = useDebounceValue(searchTerm, 500);

	const { data } = useQuery(searchUsersQueryOptions({ search }));
	const postContact = usePostContact().mutate;

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
						<SidebarMenuButton>New Group</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				{data && (
					<SidebarMenu id="search-results">
						{data.map(({ id, username, profile: { displayName } }) => (
							<SidebarMenuItem key={username}>
								<SidebarMenuButton
									value={id}
									onClick={(event) => {
										postContact(event.currentTarget.value);
										setSearchTerm("");
									}}
								>
									{displayName}
								</SidebarMenuButton>
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
				{contacts && (
					<SidebarMenu id="contacts">
						{contacts.map((contact) => (
							<ContactItem key={contact.id} contact={contact} />
						))}
					</SidebarMenu>
				)}
			</SidebarContent>
		</>
	);
}

function ContactItem({ contact }: { contact: LocalUser }) {
	const { user } = useUser();
	const { setChatId } = useChat();
	const navigate = useNavigate();
	const chat = useLiveQuery(
		() => directChatByMemberIdQueryFn(contact.id),
		[contact.id],
	);

	const onClick = async (chatId?: string) => {
		if (chatId) {
			setChatId(chatId);
		} else {
			const newChat = createChat({
				type: "direct",
				members: [user.id, contact.id],
				name: "",
				avatarUrl: "",
			});
			await db.chats.add(newChat);
			setChatId(newChat.id);
		}
		navigate({ to: "/" });
	};

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				value={chat?.id}
				onClick={(event) => onClick(event.currentTarget.value)}
			>
				{contact.profile.displayName}
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

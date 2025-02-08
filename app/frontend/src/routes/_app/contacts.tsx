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
import { selfChatQueryFn } from "@/features/chat/queries";
import { contactsQueryFn } from "@/features/contacts/queries";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";

export const Route = createFileRoute("/_app/contacts")({
	component: RouteComponent,
});

function RouteComponent() {
	const { setChatId } = useChat();
	const navigate = useNavigate();

	const selfChat = useLiveQuery(selfChatQueryFn, []);
	const contactIds = useLiveQuery(contactsQueryFn, []);

	return (
		<>
			<SidebarHeader className="flex flex-row items-center justify-between">
				Contacts
			</SidebarHeader>
			<SidebarSeparator className="mx-0" />
			<SidebarContent>
				{selfChat && (
					<SidebarGroup id="self">
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									onClick={() => {
										setChatId(selfChat.id);
										navigate({ to: "/" });
									}}
								>
									Me
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				)}
				{contactIds && (
					<SidebarGroup id="contacts">
						<SidebarMenu>
							{contactIds.map((contact) => (
								<SidebarMenuItem key={contact}>
									<SidebarMenuButton>{contact}</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				)}
			</SidebarContent>
		</>
	);
}

import {
	SidebarContent,
	SidebarSeparator
} from "@/components/ui/sidebar";

import { ProfileEditForm } from "@/features/profile/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/user")({
	component: UserSearchSidebar,
});

function UserSearchSidebar() {
	/* 
	TODO: create user list item Component with avatar, name, friend status, etc.
	TODO: add user search bar
	TODO: add filtering (contacts, all)
	*/

	return (
		<>
			<SidebarSeparator className="my-2" />
			<SidebarContent>
				<ProfileEditForm />
			</SidebarContent>
		</>
	);
}

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
	SidebarContent,
	SidebarHeader,
	SidebarSeparator,
} from "@/components/ui/sidebar.tsx";
import { useChat } from "@/features/chat/context";
import { usePostChatMutation } from "@/features/chat/hooks/mutations/use-post-chat.tsx";
import { CreateContact } from "@/features/contacts/components/create-contact.tsx";
import { syncContactsQueryOptions } from "@/features/contacts/queries.ts";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_app/contacts")({
	loader: async ({ context: { queryClient } }) => {
		return await queryClient.ensureQueryData(syncContactsQueryOptions);
	},
	component: RouteComponent,
});

const chatFormSchema = z.object({ userIds: z.string().array() });

function RouteComponent() {
	const contacts = Route.useLoaderData() || [];
	const { mutate } = usePostChatMutation();
	const { setChatId } = useChat();
	const navigate = useNavigate();

	const form = useForm({
		onSubmit: ({ value }) => {
			mutate(value.userIds, {
				onSuccess: (data) => {
					if (data) {
						setChatId(data);
						void navigate({ to: "/" });
					}
				},
			});
			form.reset();
		},
		defaultValues: {
			userIds: [],
		},
		validators: {
			onSubmit: chatFormSchema,
		},
	});

	return (
		<>
			<SidebarHeader>Kontakte</SidebarHeader>
			<SidebarSeparator className="my-2" />
			<SidebarContent>
				<CreateContact />
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						e.stopPropagation();
						await form.handleSubmit();
					}}
				>
					{contacts.map((contact) => (
						<div
							key={contact.contactId}
							className="flex items-center space-x-3"
						>
							<form.Field key={contact.contactId} name="userIds">
								{(field) => {
									const isChecked =
										field.state.value?.includes(contact.contactId) || false;

									return (
										<div className="flex w-full items-center gap-2 p-2">
											<Avatar>
												<AvatarImage src={contact.avatarUrl as string} />
												<AvatarFallback>
													{contact.displayName?.[0]}
												</AvatarFallback>
											</Avatar>
											<Label htmlFor={`option-${contact.contactId}`}>
												{contact.displayName}
											</Label>
											<Checkbox
												className="ml-auto"
												id={`option-${contact.contactId}`}
												checked={isChecked}
												onCheckedChange={async (checked) => {
													if (checked) {
														field.pushValue(contact.contactId);
													} else {
														await field.removeValue(
															field.state.value?.indexOf(contact.contactId),
														);
													}
												}}
											/>
										</div>
									);
								}}
							</form.Field>
						</div>
					))}
					<Button type="submit">Create chat</Button>
				</form>
			</SidebarContent>
		</>
	);
}

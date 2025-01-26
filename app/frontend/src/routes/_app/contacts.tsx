import {createFileRoute} from '@tanstack/react-router'
import {SidebarContent, SidebarHeader, SidebarSeparator} from "@/components/ui/sidebar.tsx";
import {syncContactsQueryOptions} from "@/features/contacts/queries.ts";
import {useForm} from "@tanstack/react-form";
import {z} from "zod";
import {Label} from "@/components/ui/label.tsx";
import {usePostChatMutation} from "@/features/chat/hooks/mutations/use-post-chat.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";

export const Route = createFileRoute('/_app/contacts')({
    loader: async ({ context: { queryClient } }) => {
        const contacts = await queryClient.ensureQueryData(
            syncContactsQueryOptions,
        );
        return contacts;
    },
  component: RouteComponent,
})

const chatFormSchema = z.object({userIds: z.string().array()})



function RouteComponent() {
    const contacts =Route.useLoaderData() || [];
    const postChat = usePostChatMutation().mutate;

    const form = useForm({
        onSubmit: ({value}) => {
            console.log(value);
            postChat(value.userIds);
            form.reset();
        },
        defaultValues: {
            userIds: []
        },
        validators: {
            onSubmit: chatFormSchema,
        },
    });

    return(
      <>
          <SidebarHeader>Kontakte</SidebarHeader>
          <SidebarSeparator className="my-2" />
          <SidebarContent>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        await form.handleSubmit()
                    }}>
                    {contacts.map((contact) => (
                        <div key={contact.contactId} className="flex items-center space-x-3">
                            <form.Field
                                key={contact.contactId}
                                name="userIds"
                                children={(field) => {
                                    const isChecked = field.state.value?.includes(contact.contactId) || false;

                                    return (
                                        <div className="flex items-center gap-2 p-2 w-full">
                                            <Avatar>
                                                <AvatarImage src={contact.avatarUrl as string} />
                                                <AvatarFallback>{contact.displayName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <Label htmlFor={`option-${contact.contactId}`}>{contact.displayName}</Label>
                                            <Checkbox
                                                className="ml-auto"
                                                id={`option-${contact.contactId}`}
                                                checked={isChecked}
                                                onCheckedChange={async (checked) => {
                                                    if(checked) {
                                                        field.pushValue(contact.contactId);
                                                    } else {
                                                        await field.removeValue(field.state.value?.indexOf(contact.contactId));
                                                    }
                                                }}
                                            />
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    ))}
                    <Button type="submit">Create chat</Button>
                </form>
          </SidebarContent>
      </>
    )
}

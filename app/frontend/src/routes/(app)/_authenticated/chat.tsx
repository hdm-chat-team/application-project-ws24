import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/features/auth";
import { ChatSocketProvider } from "@/features/chat/context/chat-provider";
import { useChatSocket } from "@/features/chat/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import api from "@/lib/api";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/_authenticated/chat")({
	component: () => (
		<ChatSocketProvider>
			<Chat />
		</ChatSocketProvider>
	),
});

function Chat() {
	const { messages, chatSocket } = useChatSocket();
	const { user } = useUser();
	useSocket();

	const form = useForm({
		defaultValues: { content: "" },
		onSubmit: async ({ value }) => {
			if (user) {
				const res = await api.chat[":topic"].$post({
					param: { topic: user.id },
					form: { content: value.content },
				});
				if (!res.ok) {
					alert("Failed to send message");
				}
			}
			form.reset();
		},
	});

	return (
		<>
			<h1>Chat</h1>
			<div>
				<h2>Chat Messages</h2>
				<ul>
					{messages.map((message) => (
						<li key={message}>{message}</li>
					))}
				</ul>
				<h2>Chat Socket Status: {chatSocket?.readyState}</h2>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.Field name="content">
						{(field) => (
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								type="text"
								onChange={(event) => field.handleChange(event.target.value)}
							/>
						)}
					</form.Field>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button type="submit" disabled={!canSubmit}>
								{isSubmitting ? "..." : "Submit"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</div>
		</>
	);
}

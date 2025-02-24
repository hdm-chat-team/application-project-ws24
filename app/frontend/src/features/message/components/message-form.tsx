import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/features/auth/hooks";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { Paperclip, SendHorizontal } from "lucide-react";
import { usePostMessage } from "../hooks";
import { createMessage, messageFormSchema } from "../utils";

export function MessageForm({ chatId }: { chatId: string }) {
	const { user } = useUser();
	const postMessage = usePostMessage(chatId);

	const form = useForm({
		defaultValues: {
			body: "", // ? persist draft in local-storage/indexedDB?
		},
		onSubmit: ({ value }) => {
			postMessage.mutate({
				message: createMessage(chatId, user.id, value.body),
			});
			form.reset();
		},
		validators: {
			onSubmit: messageFormSchema,
		},
	});

	return (
		<div className="flex w-full gap-2">
			<Button variant="secondary" size="icon" type="button">
				<Link to="/attachment">
					<Paperclip size="5" />
				</Link>
			</Button>
			<form
				className="flex flex-1 gap-2"
				autoComplete="off"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.Field name="body">
					{(field) => (
						<Input
							className="flex-1"
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
						<Button disabled={!canSubmit} type="submit" size="icon">
							{isSubmitting ? "..." : <SendHorizontal size="5" />}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}

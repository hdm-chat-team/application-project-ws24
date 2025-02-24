import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/features/auth/hooks";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Paperclip, SendHorizontal } from "lucide-react";
import { z } from "zod";
import { usePostMessage } from "../hooks";
import { createMessage } from "../utils";

const messageFormSchema = z.object({
	body: z.string().trim().nonempty(), // normal messages needs a message
	files: z.instanceof(FileList).nullable(),
});

export function MessageForm({ chatId }: { chatId: string }) {
	const { user } = useUser();
	const navigate = useNavigate();
	const postMessage = usePostMessage(chatId).mutate;

	const form = useForm({
		defaultValues: {
			body: "", // ? persist draft in local-storage/indexedDB ?
			files: null,
		},
		onSubmit: ({ value }) => {
			postMessage({
				message: createMessage(chatId, user.id, value.body),
				files: [],
			});
			form.reset();
		},
		validators: {
			onSubmit: messageFormSchema,
		},
	});

	return (
		<form
			className="flex gap-2"
			autoComplete="off"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				form.handleSubmit();
			}}
		>
			<form.Field name="files">
				{() => (
					<Button
						variant="secondary"
						size="icon"
						onClick={() =>
							navigate({
								to: "/attachment",
								search: { chatId },
							})
						}
						type="button"
					>
						<Paperclip size="5" />
					</Button>
				)}
			</form.Field>
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
	);
}

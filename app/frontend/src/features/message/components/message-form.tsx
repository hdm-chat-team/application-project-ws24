import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, SendHorizontal } from "lucide-react";

import { useUser } from "@/features/auth/hooks";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { usePostMessage } from "../hooks";
import { createMessage } from "../utils";

const messageFormSchema = z.object({
	body: z.string().trim().nonempty(),
	files: z.instanceof(FileList).nullable(),
});

export function MessageForm({ chatId }: { chatId: string }) {
	const { user } = useUser();

	const postMessage = usePostMessage(chatId).mutate;

	const form = useForm({
		defaultValues: {
			body: "", // ? persist draft in local-storage/indexedDB ?
			files: null,
		},
		onSubmit: ({ value }) => {
			postMessage({
				message: createMessage(chatId, user.id, value.body),
				files: Array.from(value.files ?? []),
			});
			form.reset();
		},
		validators: {
			onSubmit: messageFormSchema,
		},
	});

	return (
		<div className="space-y-2">
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
					{(field) => (
						<Button variant="secondary" size="icon" asChild>
							<label htmlFor={field.name}>
								<Paperclip size="5" />
								<input
									id={field.name}
									name={field.name}
									className="hidden"
									type="file"
									accept="image/*,video/*,audio/*,.pdf"
									onChange={(event) => {
										field.handleChange(event.target.files);
										console.log({ files: event.target.files });
									}}
								/>
							</label>
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
		</div>
	);
}

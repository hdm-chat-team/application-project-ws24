import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePostMessageMutation } from "@/features/message/hooks";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const messageFormSchema = z.object({ body: z.string().trim().nonempty() });

export function MessageForm({ chatId }: { chatId: string }) {
	const postMessage = usePostMessageMutation(chatId).mutate;

	const form = useForm({
		defaultValues: {
			body: "", // ? persist draft in local-storage/indexedDB ?
		},
		onSubmit: ({ value }) => {
			postMessage(value.body);
			form.reset();
		},
		validators: {
			onSubmit: messageFormSchema,
		},
	});

	return (
		<form
			className="flex"
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
	);
}

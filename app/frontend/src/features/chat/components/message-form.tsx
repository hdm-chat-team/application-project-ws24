import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePostMessageMutation } from "@/features/chat/hooks";
import { messageFormSchema } from "@shared/message";
import { useForm } from "@tanstack/react-form";

export default function MessageForm({ chatId }: { chatId: string }) {
	const postMessageMutation = usePostMessageMutation(chatId);

	const form = useForm({
		defaultValues: {
			body: "",
		},
		onSubmit: async ({ value }) => {
			await postMessageMutation.mutateAsync(value.body);

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

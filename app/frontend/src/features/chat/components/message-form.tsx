import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/features/auth";
import api from "@/lib/api";
import { messageFormSchema } from "@shared/message";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

export default function MessageForm({ chatId }: { chatId: string }) {
	const { user } = useUser();

	const postMessageMutation = useMutation({
		mutationKey: ["postMessage"],
		mutationFn: async (body: string) => {
			if (!user) {
				return;
			}
			const res = await api.chat[":id"].$post({
				param: { id: chatId },
				form: { body },
			});
			if (!res.ok) {
				throw new Error("Failed to send message");
			}
		},
	});

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

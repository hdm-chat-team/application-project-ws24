import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/features/auth";
import api from "@/lib/api";
import { messageFormSchema } from "@shared/message";
import { useForm } from "@tanstack/react-form";

export default function MessageForm() {
	const { user } = useUser();

	const form = useForm({
		defaultValues: {
			body: "",
		},
		onSubmit: async ({ value }) => {
			if (!user) {
				return;
			}
			const res = await api.chat[":id"].$post({
				param: { id: user.id },
				form: { body: value.body },
			});
			if (!res.ok) {
				alert("Failed to send message");
			}

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

import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { usePostContactMutation } from "@/features/contacts/hooks/mutations/use-post-contact.tsx";
import { useForm } from "@tanstack/react-form";
import { UserPlus } from "lucide-react";
import { z } from "zod";

export function CreateContact() {
	const { mutate } = usePostContactMutation();
	const form = useForm({
		onSubmit: ({ value }) => {
			mutate(value.email);
			form.reset();
		},
		defaultValues: {
			email: "",
		},
		validators: {
			onSubmit: z.object({ email: z.string().email().trim().nonempty() }),
		},
	});
	return (
		<div className="flex w-full max-w-sm items-center space-x-2">
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					e.stopPropagation();
					await form.handleSubmit();
				}}
			>
				<form.Field name="email">
					{(field) => (
						<>
							<Input
								type="email"
								name={field.name}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Github Email"
							/>
						</>
					)}
				</form.Field>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit}>
							{isSubmitting ? "..." : <UserPlus />}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePostMessageMutation } from "@/features/message/hooks";
import { useUploadThing } from "@/features/uploadthing/hooks";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const messageFormSchema = z.object({ body: z.string().trim().nonempty(), file: z.instanceof(File).nullable() });

export default function MessageForm({ chatId }: { chatId: string }) {
	const postMessageMutation = usePostMessageMutation(chatId);
	const { startUpload } = useUploadThing("attachment");

	const form = useForm({
		defaultValues: {
			body: "",
			file: null,
		},
		onSubmit: async ({ value }) => {
			try {
				if (value.file) {
					await startUpload([value.file]);
				} else {
					await postMessageMutation.mutateAsync(value.body);
				}
				form.reset();
			} catch (error) {
				console.error("Error:", error);
			}
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

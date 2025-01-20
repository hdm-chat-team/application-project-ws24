import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { usePostMessageMutation } from "@/features/message/hooks";
import { useUploadThing } from "@/features/uploadthing/hooks";
import { useForm } from "@tanstack/react-form";
import { FileIcon, ImageIcon, PaperclipIcon, VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const messageFormSchema = z.object({
	body: z.string().trim().nonempty(),
	file: z.instanceof(File).nullable(),
});

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
					toast.success("Upload successful");
				} else {
					await postMessageMutation.mutateAsync(value.body);
				}
				form.reset();
			} catch (error) {
				console.error("Error:", error);
				toast.error("Upload failed");
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
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button type="button" variant="ghost" size="icon">
						<PaperclipIcon className="h-5 w-5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" side="top">
					<DropdownMenuItem>
						<label className="flex w-full cursor-pointer items-center gap-2">
							<ImageIcon className="h-4 w-4" />
							<span>Bild</span>
							<input
								type="file"
								className="hidden"
								accept="image/*"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) form.setFieldValue("file", file);
								}}
							/>
						</label>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<label className="flex w-full cursor-pointer items-center gap-2">
							<VideoIcon className="h-4 w-4" />
							<span>Video</span>
							<input
								type="file"
								className="hidden"
								accept="video/*"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) form.setFieldValue("file", file);
								}}
							/>
						</label>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<label className="flex w-full cursor-pointer items-center gap-2">
							<FileIcon className="h-4 w-4" />
							<span>Dokument</span>
							<input
								type="file"
								className="hidden"
								accept="application/pdf"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) form.setFieldValue("file", file);
								}}
							/>
						</label>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

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

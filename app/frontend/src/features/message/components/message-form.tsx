import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { usePostMessageMutation } from "@/features/message/hooks";
import { useSaveAttachmentMessage } from "@/features/message/hooks/mutations/use-save-attachments";
import { useForm } from "@tanstack/react-form";
import {
	FileIcon,
	ImageIcon,
	PaperclipIcon,
	SendHorizontal,
	VideoIcon,
	XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const messageFormSchema = z
	.object({
		body: z.string().trim(),
		file: z.instanceof(File).nullable(),
	})
	.refine((data) => data.body.trim().length > 0 || data.file !== null, {
		message: "Please enter a message or upload a file",
	});

export default function MessageForm({ chatId }: { chatId: string }) {
	const postMessageMutation = usePostMessageMutation(chatId);
	const saveAttachmentMessage = useSaveAttachmentMessage(chatId);
	const [preview, setPreview] = useState<string | null>(null);
	const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			body: "",
			file: null,
		},
		onSubmit: async ({ value }) => {
			try {
				if (value.file) {
					await saveAttachmentMessage.mutateAsync({
						file: value.file,
						body: value.body,
					});
					toast.success("Upload successful");
				} else {
					await postMessageMutation.mutateAsync(value.body);
				}
				form.reset();
				setPreview(null);
				setSelectedFileName(null);
			} catch (error) {
				console.error("Error:", error);
				toast.error("Upload failed");
			}
		},
		validators: {
			onSubmit: messageFormSchema,
		},
	});

	// * Handle file selection and picture preview
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		form.setFieldValue("file", file);
		setSelectedFileName(file.name);
		setPreview(
			file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
		);
	};

	return (
		<div className="space-y-2">
			{form.state.values.file && (
				<div className="relative inline-block rounded border bg-white p-2 shadow-sm">
					<div className="flex items-center gap-2">
						{preview ? (
							<img
								src={preview}
								alt="Preview"
								className="max-h-32 rounded object-contain"
							/>
						) : (
							<div className="flex items-center gap-2">
								{form.state.values.file.type.startsWith("video/") && (
									<VideoIcon className="h-5 w-5 text-blue-500" />
								)}
								{form.state.values.file.type === "application/pdf" && (
									<FileIcon className="h-5 w-5 text-red-500" />
								)}
								<span className="font-medium text-gray-900 text-sm">
									{selectedFileName}
								</span>
							</div>
						)}

						<button
							type="button"
							onClick={() => {
								form.setFieldValue("file", null);
								setPreview(null);
								setSelectedFileName(null);
							}}
							className="-right-2 -top-2 absolute rounded-full bg-white p-1 text-gray-600 shadow-sm hover:bg-gray-200 hover:text-gray-900"
						>
							<XIcon className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			<form
				className="flex"
				autoComplete="off"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
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
						<DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
							<label className="flex w-full cursor-pointer items-center gap-2">
								<ImageIcon className="h-4 w-4" />
								<span>Picture</span>
								<input
									type="file"
									className="hidden"
									accept="image/*"
									onChange={handleFileSelect}
								/>
							</label>
						</DropdownMenuItem>
						<DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
							<label className="flex w-full cursor-pointer items-center gap-2">
								<VideoIcon className="h-4 w-4" />
								<span>Video</span>
								<input
									type="file"
									className="hidden"
									accept="video/*"
									onChange={handleFileSelect}
								/>
							</label>
						</DropdownMenuItem>
						<DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
							<label className="flex w-full cursor-pointer items-center gap-2">
								<FileIcon className="h-4 w-4" />
								<span>Document (PDF)</span>
								<input
									type="file"
									className="hidden"
									accept="application/pdf"
									onChange={handleFileSelect}
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
							{isSubmitting ? "..." : <SendHorizontal className="h-5 w-5" />}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}

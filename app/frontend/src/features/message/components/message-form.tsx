import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { usePostAttachment } from "@/features/message/hooks/mutations/use-post-attachments.tsx";
import { useSaveMessage } from "@/features/message/hooks/mutations/use-save-message";
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
import { usePostMessageMutation } from "../hooks/mutations/use-post-message";

const messageFormSchema = z
	.object({
		body: z.string().trim(),
		file: z.instanceof(File).nullable(),
	})
	.refine((data) => data.body.trim().length > 0 || data.file !== null, {
		message: "Please enter a message or upload a file",
	});

// * File Upload component
const FileUploadMenuItem = ({
	icon: Icon,
	label,
	accept,
	onSelect,
}: {
	icon: typeof ImageIcon;
	label: string;
	accept: string;
	onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
	<DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
		<label className="flex w-full cursor-pointer items-center gap-2">
			<Icon className="h-4 w-4" />
			<span>{label}</span>
			<input
				type="file"
				className="hidden"
				accept={accept}
				onChange={onSelect}
			/>
		</label>
	</DropdownMenuItem>
);

const UPLOAD_OPTIONS = [
	{ icon: ImageIcon, label: "Picture", accept: "image/*" },
	{ icon: VideoIcon, label: "Video", accept: "video/*" },
	{ icon: FileIcon, label: "Document (PDF)", accept: "application/pdf" },
] as const;

// * Attachment Preview
const FilePreview = ({
	file,
	preview,
	fileName,
	onRemove,
}: {
	file: File;
	preview: string | null;
	fileName: string | null;
	onRemove: () => void;
}) => (
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
					{file.type.startsWith("video/") && (
						<VideoIcon className="h-5 w-5 text-blue-500" />
					)}
					{file.type === "application/pdf" && (
						<FileIcon className="h-5 w-5 text-red-500" />
					)}
					<span className="font-medium text-gray-900 text-sm">{fileName}</span>
				</div>
			)}
			<button
				type="button"
				onClick={onRemove}
				className="-right-2 -top-2 absolute rounded-full bg-white p-1 text-gray-600 shadow-sm hover:bg-gray-200 hover:text-gray-900"
			>
				<XIcon className="h-4 w-4" />
			</button>
		</div>
	</div>
);

export default function MessageForm({ chatId }: { chatId: string }) {
	const postMessageMutation = usePostMessageMutation(chatId);
	const postAttachment = usePostAttachment(chatId);
	const saveAttachment = useSaveMessage();
	const [preview, setPreview] = useState<string | null>(null);
	const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

	const resetForm = () => {
		form.reset();
		setPreview(null);
		setSelectedFileName(null);
	};

	const form = useForm({
		defaultValues: {
			body: "",
			file: null,
		},
		onSubmit: async ({ value }) => {
			try {
				if (value.file) {
					const result = await postAttachment.mutateAsync({
						file: value.file,
						body: value.body,
					});

					if (result) {
						await saveAttachment.mutateAsync(result);
						toast.success("Upload successful");
					}
				} else {
					await postMessageMutation.mutateAsync(value.body);
				}
				resetForm();
			} catch (error) {
				console.error("Error:", error);
				toast.error("Upload failed");
			}
		},
		validators: {
			onSubmit: messageFormSchema,
		},
	});

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
				<FilePreview
					file={form.state.values.file}
					preview={preview}
					fileName={selectedFileName}
					onRemove={() => {
						form.setFieldValue("file", null);
						setPreview(null);
						setSelectedFileName(null);
					}}
				/>
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
						{UPLOAD_OPTIONS.map((option) => (
							<FileUploadMenuItem
								key={option.label}
								icon={option.icon}
								label={option.label}
								accept={option.accept}
								onSelect={handleFileSelect}
							/>
						))}
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

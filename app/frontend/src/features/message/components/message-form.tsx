import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	FileIcon,
	ImageIcon,
	PaperclipIcon,
	SendHorizontal,
	VideoIcon,
	XIcon,
} from "lucide-react";

import { useUser } from "@/features/auth/hooks";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { usePostMessage } from "../hooks";
import { createMessage } from "../utils";

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

export function MessageForm({ chatId }: { chatId: string }) {
	const { user } = useUser();

	const { mutate: postMessage } = usePostMessage(chatId);

	const [preview, setPreview] = useState<string | null>(null);
	const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			body: "", // ? persist draft in local-storage/indexedDB ?
			file: null,
		},
		onSubmit: ({ value }) => {
			const message = createMessage(chatId, user.id, value.body);

			postMessage(message);
			form.reset();
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
						<Button disabled={!canSubmit} type="submit" size="icon">
							{isSubmitting ? "..." : <SendHorizontal className="h-5 w-5" />}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}

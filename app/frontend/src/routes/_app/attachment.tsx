import { Button } from "@/components/ui/button";
import { useUser } from "@/features/auth/hooks";
import { useChat } from "@/features/chat/context";
import { usePostMessage } from "@/features/message/hooks";
import { createMessage } from "@/features/message/utils";
import { CaptionInput } from "@/features/uploadthing/components/caption-input";
import { FilePicker } from "@/features/uploadthing/components/file-picker";
import { FilePreview } from "@/features/uploadthing/components/file-preview";
import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_app/attachment")({
	validateSearch: z.object({
		chatId: z.string().min(1),
	}),
	component: AttachmentPage,
});

const attachmentFormSchema = z.object({
	body: z.string(), // Body is optional for attachments
	file: z.instanceof(File, { message: "Attachment is required" }),
});

function AttachmentPage() {
	const { chatId } = Route.useSearch();
	const navigate = useNavigate();
	const { setChatId } = useChat();
	const { user } = useUser();
	const postMessage = usePostMessage(chatId).mutate;

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [caption, setCaption] = useState("");
	const [fileUrl, setFileUrl] = useState<string>("");

	const handleFileSelect = (file: File) => {
		setSelectedFile(file);
		setFileUrl(URL.createObjectURL(file));
	};

	const handleSubmit = async () => {
		try {
			if (!selectedFile) {
				toast.error("Please select a file");
				return;
			}

			const fileSizeMB = selectedFile.size / (1024 * 1024);
			let maxSize: number;

			if (selectedFile.type.startsWith("video/")) {
				maxSize = 16;
			} else if (selectedFile.type.startsWith("image/")) {
				maxSize = 4;
			} else if (selectedFile.type === "application/pdf") {
				maxSize = 4;
			} else {
				toast.error("Unsupported file type");
				return;
			}

			if (fileSizeMB > maxSize) {
				toast.error(`File too large! Maximum size is ${maxSize}MB`);
				return;
			}

			const validatedData = attachmentFormSchema.parse({
				body: caption,
				file: selectedFile,
			});

			await postMessage({
				message: createMessage(chatId, user.id, validatedData.body),
				files: [validatedData.file],
			});

			toast.success("File uploaded successfully");
			setChatId(chatId);
			navigate({ to: "/" });
		} catch (error) {
			toast.error("Failed to upload file");
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/90">
			<div className="relative max-h-[90vh] w-full max-w-md rounded-lg bg-background p-4">
				{/* Header */}
				<header className="border-b">
					<div className="sticky top-0 z-10 mb-4 bg-background">
						<Button onClick={() => navigate({ to: "/" })} variant="ghost">
							<ArrowLeft size={20} />
							Back to chat
						</Button>
					</div>
				</header>

				{/* File Upload */}
				<div className="w-full max-w-md p-4">
					{!selectedFile ? (
						<FilePicker onFileSelect={handleFileSelect} />
					) : (
						<div className="space-y-4">
							<FilePreview file={selectedFile} url={fileUrl} />
							<CaptionInput
								value={caption}
								onChange={setCaption}
								onSubmit={handleSubmit}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

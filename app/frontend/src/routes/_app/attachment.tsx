import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/features/auth/hooks";
import { useChat } from "@/features/chat/context";
import { usePostMessage } from "@/features/message/hooks";
import { createMessage } from "@/features/message/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText, ImageIcon, Video } from "lucide-react";
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
	body: z.string(),
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
		<div className="fixed inset-0 bg-black/90">
			{/* Header */}
			<header className="border-b">
				<div className="p-4">
					<Button onClick={() => navigate({ to: "/" })} variant="ghost">
						<ArrowLeft size={20} />
						Back to chat
					</Button>
				</div>
			</header>

			{/* File Upload */}
			<div className="flex h-[calc(100vh-4rem)] items-center justify-center">
				<div className="w-full max-w-md p-4">
					{!selectedFile ? (
						<div className="space-y-8">
							<h2 className="text-center text-xl">Pick a file</h2>
							{/* Pick a file */}
							<div className="grid grid-cols-2 gap-4">
								<Button
									onClick={() => document.getElementById("imageInput")?.click()}
									className="flex h-32 flex-col items-center gap-2 border-2 border-red-500 bg-transparent hover:bg-red-500/10"
								>
									<ImageIcon size={32} />
									<span>Image</span>
								</Button>

								<Button
									onClick={() => document.getElementById("videoInput")?.click()}
									className="flex h-32 flex-col items-center gap-2 border-2 border-red-500 bg-transparent hover:bg-red-500/10"
								>
									<Video size={32} />
									<span>Video</span>
								</Button>

								<Button
									onClick={() => document.getElementById("pdfInput")?.click()}
									className="col-span-2 flex h-32 flex-col items-center gap-2 border-2 border-red-500 bg-transparent hover:bg-red-500/10"
								>
									<FileText size={32} />
									<span>Document</span>
								</Button>
							</div>

							{/* Hidden Inputs for File Selection */}
							<div className="hidden">
								<input
									id="imageInput"
									type="file"
									accept="image/*"
									onChange={(e) =>
										e.target.files?.[0] && handleFileSelect(e.target.files[0])
									}
								/>
								<input
									id="videoInput"
									type="file"
									accept="video/*"
									onChange={(e) =>
										e.target.files?.[0] && handleFileSelect(e.target.files[0])
									}
								/>
								<input
									id="pdfInput"
									type="file"
									accept=".pdf"
									onChange={(e) =>
										e.target.files?.[0] && handleFileSelect(e.target.files[0])
									}
								/>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{/* File Preview */}
							<div className="overflow-hidden rounded-lg border">
								{selectedFile.type.startsWith("image/") && (
									<img
										src={fileUrl}
										alt="Preview"
										className="max-h-[400px] w-full object-contain"
									/>
								)}

								{selectedFile.type.startsWith("video/") && (
									<video
										src={fileUrl}
										controls
										className="max-h-[400px] w-full object-contain"
									>
										<track kind="captions" />
									</video>
								)}

								{selectedFile.type === "application/pdf" && (
									<div className="relative aspect-[3/4] max-h-[400px] w-full overflow-hidden">
										<embed
											src={fileUrl}
											type="application/pdf"
											className="h-full w-full"
										/>
										<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 p-4">
											<div className="flex items-center gap-2">
												<FileText size={20} />
												<span className="font-medium">{selectedFile.name}</span>
											</div>
										</div>
									</div>
								)}
							</div>

							{/* Caption Input */}
							<div className="flex gap-2">
								<Input
									value={caption}
									onChange={(e) => setCaption(e.target.value)}
									placeholder="Add a caption..."
									className="flex-1"
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSubmit();
										}
									}}
								/>
								<Button onClick={handleSubmit} className="rounded-full">
									<ArrowLeft className="rotate-[135deg]" size={20} />
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

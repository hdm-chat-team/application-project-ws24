import { useUser } from "@/features/auth/hooks";
import { useChat } from "@/features/chat/context";
import { usePostMessage } from "@/features/message/hooks";
import { createMessage } from "@/features/message/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
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

	return;
}

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_app/attachment")({
	validateSearch: z.object({
		chatId: z.string().min(1),
	}),
	component: AttachmentPage,
});

const attachmentFormSchema = z.object({
	body: z.string(),
	file: z.instanceof(File, { message: "Eine Datei ist erforderlich" }),
});

function AttachmentPage() {
}

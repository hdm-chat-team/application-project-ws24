import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_app/attachment")({
	validateSearch: z.object({
		chatId: z.string().min(1),
	}),
	component: AttachmentPage,
});

function AttachmentPage() {
}

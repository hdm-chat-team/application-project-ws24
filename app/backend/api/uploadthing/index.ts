import type { Env } from "#api/app.env";
import { createRouter } from "#api/factory";
import { insertAttachment } from "#db/attachments";
import type { attachmentTypeEnum } from "#db/attachments.sql";
import { insertMessage } from "#db/messages";
import env from "#env";
import { createId } from "@application-project-ws24/cuid";
import { contextStorage, getContext } from "hono/context-storage";
import {
	type FileRouter as FR,
	UTFiles,
	createRouteHandler,
	createUploadthing,
} from "uploadthing/server";
import type { UploadedFileData } from "uploadthing/types";

interface FileWithMessageId extends UploadedFileData {
	messageId: string;
	chatId: string;
	messageText?: string;
}

const routeBuilder = createUploadthing();

export const uploadRouter = {
	avatar: routeBuilder(["image"])
		.middleware(async ({ files }) => {
			const { user, session } = getContext<Env>().var;
			if (!(user && session)) throw new Error("Unauthorized");

			const fileOverrides = files.map((file) => {
				return { ...file, name: `${user.id}:avatar`, customId: createId() };
			});

			return { [UTFiles]: fileOverrides };
		})
		.onUploadComplete(({ file }) => ({
			url: file.url,
		})),

	attachment: routeBuilder(["image", "video", "pdf"])
		.middleware(async ({ files }) => {
			const { user, session } = getContext<Env>().var;
			if (!(user && session)) throw new Error("Unauthorized");

			const messageId = createId();
			const fileOverrides = files.map((file) => {
				return { ...file, name: `${user.id}:attachment`, messageId };
			});

			return { [UTFiles]: fileOverrides };
		})
		.onUploadComplete(async ({ file }) => {
			const { user } = getContext<Env>().var;
			if (!user) throw new Error("Unauthorized");

			const { messageId, chatId, messageText } = file as FileWithMessageId;

			await insertMessage({
				id: messageId,
				chatId,
				authorId: user.id,
				state: "pending",
				body: messageText || "",
				createdAt: new Date().toISOString(),
			});

			const type: (typeof attachmentTypeEnum.enumValues)[number] =
				file.type.startsWith("image/")
					? "image"
					: file.type.startsWith("video/")
						? "video"
						: file.type.startsWith("application/pdf")
							? "document"
							: "document";

			await insertAttachment({
				url: file.url,
				type,
				messageId,
			});
			return { url: file.url, messageId };
		}),
} satisfies FR;

const handlers = createRouteHandler({
	router: uploadRouter,
	config: {
		token: env.UPLOADTHING_TOKEN,
	},
});

export const uploadthingRouter = createRouter()
	.use(contextStorage())
	.all("/", (c) => handlers(c.req.raw));

export type FileRouter = typeof uploadRouter;

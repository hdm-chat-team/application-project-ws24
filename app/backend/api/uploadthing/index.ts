import { createId } from "@application-project-ws24/cuid";
import { contextStorage, getContext } from "hono/context-storage";
import {
	type FileRouter as FR,
	UTFiles,
	createRouteHandler,
	createUploadthing,
} from "uploadthing/server";
import { z } from "zod";
import type { Env } from "#api/app.env";
import { createRouter } from "#api/factory";
import { insertAttachment } from "#db/attachments";
import type { attachmentTypeEnum } from "#db/attachments.sql";
import { insertMessage } from "#db/messages";
import env from "#env";

const attachmentInput = z.object({
	chatId: z.string(),
});

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
		.input(attachmentInput)
		.middleware(async ({ files, input }) => {
			const { user, session } = getContext<Env>().var;
			if (!(user && session)) throw new Error("Unauthorized");

			const messageId = createId();

			await insertMessage({
				id: messageId,
				chatId: input.chatId,
				authorId: user.id,
				state: "sent",
				body: "",
				createdAt: new Date().toISOString(),
			});

			const fileOverrides = files.map((file) => ({
				...file,
				name: `${user.id}:attachment`,
				customId: messageId,
			}));

			return { [UTFiles]: fileOverrides };
		})
		.onUploadComplete(async ({ file }) => {
			if (!file.customId) {
				throw new Error("No messageId found");
			}

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
				messageId: file.customId,
			});

			return { url: file.url };
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

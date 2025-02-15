import { createId, cuidParamSchema } from "@application-project-ws24/cuid";
import { contextStorage, getContext } from "hono/context-storage";
import {
	type FileRouter as FR,
	UTApi,
	UTFiles,
	UploadThingError,
	createRouteHandler,
	createUploadthing,
} from "uploadthing/server";
import type { Env } from "#api/app.env";
import { createRouter } from "#api/factory";
import { insertAttachment } from "#db/attachments";
import { selectMessageRecipientIdsByMessageId } from "#db/messages";
import { updateUserProfile } from "#db/users";
import env from "#env";
import { handleImageUpload } from "#lib/compression";
import { publish } from "#lib/utils";

const routeBuilder = createUploadthing();

// TODO: delete frontend compression file if everything is working

export const uploadRouter = {
	avatar: routeBuilder({
		image: { maxFileSize: "4MB", minFileCount: 1, maxFileCount: 1 },
	})
		.middleware(async ({ files }) => {
			const { profile } = uploadRouterAuth();

			const fileOverrides = files.map((file) => ({
				...file,
				name: `${profile.id}:avatar`,
				customId: createId(),
			}));

			return { [UTFiles]: fileOverrides, profile };
		})
		.onUploadComplete(async ({ file, metadata: { profile } }) => {
			const url = await handleImageUpload(file);

			const [{ avatarUrl }] = await updateUserProfile.execute({
				...profile,
				avatarUrl: url,
			});
			if (!avatarUrl) throw uploadthingDBError("Failed to update avatar");
			return { avatarUrl };
		}),
	attachment: routeBuilder({
		image: { maxFileSize: "4MB", maxFileCount: 1 },
		video: { maxFileSize: "16MB", maxFileCount: 1 },
		pdf: { maxFileSize: "4MB", maxFileCount: 1 },
	})
		.input(cuidParamSchema)
		.middleware(async ({ files, input: { id: messageId } }) => {
			uploadRouterAuth();

			const fileOverrides = files.map((file) => ({
				...file,
				name: `${messageId}:attachment`,
				customId: createId(),
			}));

			return { [UTFiles]: fileOverrides, messageId };
		})
		.onUploadComplete(async ({ file, metadata: { messageId } }) => {
			const url = await handleImageUpload(file);
			const [attachment] = await insertAttachment
				.execute({
					url,
					type: file.type,
					messageId,
				})
				.catch(() => {
					throw uploadthingDBError("Failed to insert attachment");
				});

			const recipientIds = await selectMessageRecipientIdsByMessageId
				.execute({ messageId })
				.catch(() => {
					throw uploadthingDBError("Failed to select recipient IDs");
				})
				.then((rows) => rows.map(({ recipientId }) => recipientId));

			for (const recipientId of recipientIds)
				publish(recipientId, {
					type: "message_attachment",
					payload: attachment,
				});

			return attachment;
		}),
} satisfies FR;
export type FileRouter = typeof uploadRouter;

const handlers = createRouteHandler({
	router: uploadRouter,
	config: {
		token: env.UPLOADTHING_TOKEN,
	},
});

export const uploadthingRouter = createRouter()
	.use(contextStorage())
	.mount("/", (request) => handlers(request));

export const utapi = new UTApi({
	token: env.UPLOADTHING_TOKEN,
});

// * utils
function uploadRouterAuth() {
	const { user, profile, session } = getContext<Env>().var;
	if (!(user && profile && session))
		throw new UploadThingError({
			code: "FORBIDDEN",
			message: "Unauthorized",
		});
	return { user, profile, session };
}

const uploadthingDBError = (message: string) =>
	new UploadThingError({
		code: "INTERNAL_SERVER_ERROR",
		cause: "Database",
		message,
	});

import { createId, cuidParamSchema } from "@application-project-ws24/cuid";
import { contextStorage, getContext } from "hono/context-storage";
import sharp from "sharp";
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
import { publish } from "#lib/utils";

const routeBuilder = createUploadthing();

async function handleImageUpload(file: { url: string; key: string }) {
	try {
		// * download the image
		const buffer = await fetch(file.url)
			.then((res) => res.arrayBuffer())
			.then(Buffer.from);

		// * compress the image
		const compressed = await sharp(buffer)
			.resize(800, 800, { fit: "inside", withoutEnlargement: true })
			.jpeg({ quality: 80 })
			.toBuffer();

		// * upload the compressed image
		const [{ data }] = await utapi.uploadFiles([
			new File([compressed], file.key, { type: "image/jpeg" }),
		]);

		// * delete the uncompressed image
		await utapi.deleteFiles([file.key]);

		return data?.url;
	} catch {
		throw new Error("Image processing failed");
	}
}

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
		.onUploadComplete(async ({ file: { url }, metadata: { profile } }) => {
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
		.onUploadComplete(
			async ({ file: { url, type }, metadata: { messageId } }) => {
				const [attachment] = await insertAttachment
					.execute({
						url,
						type,
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
			},
		),
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

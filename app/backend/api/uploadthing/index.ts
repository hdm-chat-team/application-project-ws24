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

const KB = 1024;
const MB = 1024 * KB;

function getCompressionStrategy(fileSize: number) {
	if (fileSize > 2 * MB) {
		return {
			quality: 65,
			effort: 8,
			chromaSubsampling: "4:2:0",
		};
	}
	if (fileSize > 500 * KB) {
		return {
			quality: 75,
			effort: 8,
			chromaSubsampling: "4:2:0",
		};
	}
	return {
		quality: 80,
		effort: 9,
		chromaSubsampling: "4:4:4",
	};
}

async function handleImageUpload(file: { url: string; key: string }) {
	const startTime =
		process.env.NODE_ENV === "development" ? performance.now() : 0;

	try {
		const buffer = await fetch(file.url)
			.then((res) => res.arrayBuffer())
			.then(Buffer.from);

		const settings = getCompressionStrategy(buffer.byteLength);

		const compressed = await sharp(buffer)
			.resize(800, 800, {
				fit: "inside",
				withoutEnlargement: true,
			})
			.avif(settings)
			.toBuffer();

		const [{ data }] = await utapi.uploadFiles([
			new File([compressed], file.key, { type: "image/avif" }),
		]);

		await utapi.deleteFiles([file.key]);

		if (process.env.NODE_ENV === "development") {
			const compressionRatio = (
				(compressed.length / buffer.length) *
				100
			).toFixed(1);
			const processingTime = (performance.now() - startTime).toFixed(0);
			console.log(
				`Compressed ${file.key}: ${compressionRatio}% of original in ${processingTime}ms`,
			);
		}

		return data?.url;
	} catch (error) {
		console.error("Image processing failed:", error);
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

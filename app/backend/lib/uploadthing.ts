import { type FileRouter, createUploadthing } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
	imageUploader: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 4,
		},
	}).onUploadComplete((data) => {
		console.log("upload completed", data);
	}),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

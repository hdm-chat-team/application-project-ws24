import type { FileRouter } from "@server/api/uploadthing";
import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing } =
	generateReactHelpers<FileRouter>();

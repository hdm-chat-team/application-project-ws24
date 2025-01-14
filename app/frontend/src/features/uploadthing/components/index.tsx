import type { FileRouter } from "@server/api/uploadthing";

import {
	generateUploadButton,
	generateUploadDropzone,
} from "@uploadthing/react";

export const UploadButton = generateUploadButton<FileRouter>();
export const UploadDropzone = generateUploadDropzone<FileRouter>();

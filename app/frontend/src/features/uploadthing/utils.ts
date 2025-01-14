import type { FileRouter } from "@server/api/uploadthing";
import { generateReactHelpers } from "@uploadthing/react";

export const { createUpload, getRouteConfig, uploadFiles, routeRegistry } =
	generateReactHelpers<FileRouter>();

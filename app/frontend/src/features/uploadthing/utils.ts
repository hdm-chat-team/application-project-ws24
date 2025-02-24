import type { FileRouter } from "@server/api/uploadthing";
import { generateReactHelpers } from "@uploadthing/react";

export const { createUpload, getRouteConfig, uploadFiles, routeRegistry } =
	generateReactHelpers<FileRouter>();

export function fileUrl(customId: string): string {
	// @ts-expect-error - VITE env variable
	const appId = import.meta.env.VITE_UPLOADTHING_APP_ID;
	return `https://${appId}.ufs.sh/f/${customId}`;
}

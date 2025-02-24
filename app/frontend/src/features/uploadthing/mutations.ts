import { db } from "@/lib/db";
import { localFileSchema } from "./types";

export async function saveFile(file: File, customId: string): Promise<string> {
	try {
		const metadata = {
			customId,
			originalName: file.name,
			type: file.type,
			createdAt: new Date(),
		};

		const validatedMetadata = localFileSchema.parse(metadata);
		await db.files.put(validatedMetadata);

		await db.files.update(customId, { blob: file });

		return customId;
	} catch (error) {
		console.error("Failed to save file:", error);
		throw new Error("Failed to save file");
	}
}

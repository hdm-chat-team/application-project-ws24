import { db } from "@/lib/db";
import { localFileSchema } from "./types";

export async function saveFile(file: File, customId: string): Promise<string> {
	try {
		const newFile = {
			customId,
			originalName: file.name,
			type: file.type,
			createdAt: new Date(),
			blob: file,
		};

		const validatedFile = localFileSchema.parse(newFile);
		await db.files.add(validatedFile);

		return customId;
	} catch (error) {
		console.error("Failed to save file:", error);
		throw new Error("Failed to save file");
	}
}
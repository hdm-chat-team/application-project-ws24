import sharp from "sharp";
import { UTApi } from "uploadthing/server";
import env from "#env";

const utapi = new UTApi({ token: env.UPLOADTHING_TOKEN });

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

export async function handleImageUpload(file: {
	url: string;
	key: string;
	type: string;
}) {
	if (!file.type.startsWith("image/")) {
		return file.url;
	}

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
			console.log(`Compressed ${file.key}: ${compressionRatio}% of original`);
		}

		return data?.url;
	} catch (error) {
		console.error("Image processing failed:", error);
		throw new Error("Image processing failed");
	}
}

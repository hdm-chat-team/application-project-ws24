import { encode } from "@jsquash/avif/";

const KB = 1024;
const MB = 1024 * KB;

function getCompressionSettings(fileSize: number) {
	if (fileSize > 2 * MB) {
		return { quality: 65, speed: 10, subsample: 2 };
	}
	if (fileSize > 500 * KB) {
		return { quality: 75, speed: 10, subsample: 2 };
	}
	return { quality: 80, speed: 10, subsample: 1 };
}

export async function compressToAvif(file: File): Promise<File> {
	const startTime = performance.now();

	if (!file.type.startsWith("image/")) {
		return file;
	}

	try {
		const objectUrl = URL.createObjectURL(file);
		const img = new Image();

		const bitmap = await new Promise<ImageBitmap>((resolve, reject) => {
			img.onload = () => createImageBitmap(img).then(resolve).catch(reject);
			img.onerror = () => reject(new Error("Failed to load image"));
			img.src = objectUrl;
		});
		URL.revokeObjectURL(objectUrl);

		const canvas = document.createElement("canvas");
		canvas.width = bitmap.width;
		canvas.height = bitmap.height;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) throw new Error("Failed to get 2D context");

		ctx.drawImage(bitmap, 0, 0);
		const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
		const settings = getCompressionSettings(file.size);
		const avifBuffer = await encode(imageData, settings);

		if (avifBuffer.byteLength === 0 || avifBuffer.byteLength >= file.size) {
			return file;
		}

		const newFile = new File(
			[avifBuffer],
			file.name.replace(/\.[^/.]+$/, ".avif"),
			{
				type: "image/avif",
			},
		);

		console.log(
			`Compressed ${file.name}: ${((newFile.size / file.size) * 100).toFixed(1)}% of original in ${(performance.now() - startTime).toFixed(0)}ms`,
		);

		return newFile;
	} catch (error) {
		console.warn("Image compression failed, using original:", error);
		return file;
	}
}

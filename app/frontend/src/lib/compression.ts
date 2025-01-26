import { encode } from "@jsquash/avif/";

const { DEV } = import.meta.env;
const KB = 1024;
const MB = 1024 * KB;

function getCompressionStrategy(fileSize: number) {
	if (fileSize > 2 * MB) {
		return { quality: 65, speed: 10, subsample: 2 };
	}
	if (fileSize > 500 * KB) {
		return { quality: 75, speed: 10, subsample: 2 };
	}
	return { quality: 80, speed: 10, subsample: 1 };
}

export async function compressToAvif(file: File): Promise<File> {
	const startTime = DEV ? performance.now() : 0;

	try {
		const objectUrl = URL.createObjectURL(file);
		const image = new Image();

		const bitmap = await new Promise<ImageBitmap>((resolve, reject) => {
			image.onload = () => createImageBitmap(image).then(resolve).catch(reject);
			image.onerror = () => reject(new Error("Failed to load image"));
			image.src = objectUrl;
		});
		URL.revokeObjectURL(objectUrl);

		const canvas = document.createElement("canvas");
		canvas.width = bitmap.width;
		canvas.height = bitmap.height;
		const canvasContext = canvas.getContext("2d", { willReadFrequently: true });
		if (!canvasContext) throw new Error("Failed to get 2D context");

		canvasContext.drawImage(bitmap, 0, 0);
		const imageData = canvasContext.getImageData(
			0,
			0,
			bitmap.width,
			bitmap.height,
		);
		const settings = getCompressionStrategy(file.size);
		const avifBuffer = await encode(imageData, settings);

		const convertedFile = new File(
			[avifBuffer],
			file.name.replace(/\.[^/.]+$/, ".avif"),
			{
				type: "image/avif",
			},
		);

		if (DEV) {
			const compressionRatio = ((convertedFile.size / file.size) * 100).toFixed(
				1,
			);
			const processingTime = (performance.now() - startTime).toFixed(0);
			console.log(
				`Compressed ${file.name}: ${compressionRatio}% of original in ${processingTime}ms`,
			);
		}

		return convertedFile;
	} catch (error) {
		if (DEV) console.warn("Image compression failed, using original:", error);
		return file;
	}
}

import { encode } from "@jsquash/avif/";

const KB = 1024;
const MB = 1024 * KB;

function getCompressionSettings(fileSize: number) {
    if (fileSize > 2 * MB) {
        return { quality: 65, speed: 10, subsample: 2 }; // Aggressive compression for large files
    }
    if (fileSize > 500 * KB) {
        return { quality: 75, speed: 10, subsample: 2 }; // Medium compression
    }
    return { quality: 80, speed: 10, subsample: 1 }; // Light compression for small files
}

export async function compressToAvif(file: File): Promise<File> {
	const startTime = performance.now();
	let lastTime = startTime;

	const mark = (label: string) => {
		const now = performance.now();
		const duration = now - lastTime;
		console.log(`⏱️ ${label}: ${duration.toFixed(1)}ms`);
		lastTime = now;
	};

	mark("Start");
	console.log(
		`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}b`,
	);

	if (!file.type.startsWith("image/")) {
		console.log("Skipping non-image file");
		return file;
	}

	try {
		mark("Before buffer");
		const arrayBuffer = await file.arrayBuffer();
		mark("Buffer loaded");
		console.log(`File loaded to buffer, size: ${arrayBuffer.byteLength}b`);

		let bitmap: ImageBitmap;
		try {
			const objectUrl = URL.createObjectURL(file);
			const img = new Image();

			bitmap = await new Promise((resolve, reject) => {
				img.onload = () => {
					mark("Image loaded");
					createImageBitmap(img)
						.then((bitmap) => {
							mark("Bitmap created");
							resolve(bitmap);
						})
						.catch(reject);
				};
				img.onerror = () => reject(new Error("Failed to load image"));
				img.src = objectUrl;
			});
			URL.revokeObjectURL(objectUrl);
			console.log("Bitmap created successfully");
		} catch (bitmapError) {
			console.error("Failed to create bitmap:", bitmapError);
			throw bitmapError;
		}

		console.log(`Image dimensions: ${bitmap.width}x${bitmap.height}`);
		mark("Canvas setup");

		try {
			const canvas = document.createElement("canvas");
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;

			const ctx = canvas.getContext("2d", {
				willReadFrequently: true,
				alpha: true,
			});

			if (!ctx) {
				throw new Error("Failed to get 2D context");
			}

			console.log("Canvas and context created successfully");
			ctx.drawImage(bitmap, 0, 0);
			console.log("Image drawn to canvas");

			const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
			console.log(
				"Image data extracted, size:",
				imageData.width * imageData.height * 4,
				"bytes",
			);

			console.log("Initializing AVIF encoder...");
			mark("Before encoding");

			console.log("Starting AVIF encoding...");
			try {
				const settings = getCompressionSettings(file.size);
				console.log("Using compression settings:", settings);

				const avifBuffer = await encode(imageData, settings);
				mark("After encoding");
				console.log("AVIF encoding completed successfully");

				if (avifBuffer.byteLength === 0) {
					throw new Error("AVIF compression resulted in empty buffer");
				}

				// Compare sizes and return smaller version
				if (avifBuffer.byteLength >= file.size) {
					console.log("AVIF version is larger, keeping original format");
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
					`New file created: ${newFile.name}, compression ratio: ${((newFile.size / file.size) * 100).toFixed(1)}%`,
				);

				mark("Complete");
				console.log(
					"⏱️ Total process time:",
					(performance.now() - startTime).toFixed(1),
					"ms",
				);
				return newFile;
			} catch (encodeError) {
				console.error("AVIF encoding failed:", encodeError);
				console.error(
					"Image data dimensions:",
					imageData.width,
					"x",
					imageData.height,
				);
				throw encodeError;
			}
		} catch (canvasError) {
			console.error("Canvas operations failed:", canvasError);
			throw canvasError;
		}
	} catch (error) {
		console.error("Image compression failed:", error);
		console.error("Original file details:", {
			name: file.name,
			type: file.type,
			size: file.size,
		});
		throw error;
	}
}

import { FileText } from "lucide-react";

interface FilePreviewProps {
	file: File;
	url: string;
}

export function FilePreview({ file, url }: FilePreviewProps) {
	return (
		<div className="overflow-hidden rounded-lg border">
			{file.type.startsWith("image/") && (
				<img
					src={url}
					alt="Preview"
					className="max-h-[400px] w-full object-contain"
				/>
			)}
			{file.type.startsWith("video/") && (
				<video
					src={url}
					controls
					className="max-h-[400px] w-full object-contain"
				>
					<track kind="captions" />
				</video>
			)}
			{file.type === "application/pdf" && (
				<div className="relative aspect-[3/4] max-h-[400px] w-full overflow-hidden">
					<embed src={url} type="application/pdf" className="h-full w-full" />
					<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 p-4">
						<div className="flex items-center gap-2">
							<FileText size={20} />
							<span className="font-medium">{file.name}</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
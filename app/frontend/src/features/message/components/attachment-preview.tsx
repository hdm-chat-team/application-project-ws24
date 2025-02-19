import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileIcon, X } from "lucide-react";

type AttachmentPreviewProps = {
	file: File;
	onRemove: () => void;
	caption: string;
	onCaptionChange: (value: string) => void;
	onSubmit: () => void;
};

export function AttachmentPreview({
	file,
	onRemove,
	caption,
	onCaptionChange,
	onSubmit,
}: AttachmentPreviewProps) {
	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
			{/* X-Button */}
			<Button
				variant="secondary"
				size="icon"
				onClick={onRemove}
				className="absolute top-4 right-4 z-10 rounded-full hover:bg-destructive"
			>
				<X size={16} />
			</Button>

			{/* Preview Container */}
			<div className="w-full max-w-4xl p-8">
				{file.type.startsWith("image/") && (
					<div className="relative max-h-[80vh] w-auto overflow-hidden rounded-lg bg-muted">
						<img
							src={URL.createObjectURL(file)}
							alt="Preview"
							className="h-full w-full object-contain"
						/>
					</div>
				)}
				{file.type.startsWith("video/") && (
					<div className="relative max-h-[50vh] w-full overflow-hidden rounded-lg bg-black">
						<video
							src={URL.createObjectURL(file)}
							controls
							className="h-full w-full"
							preload="metadata"
							style={{
								objectFit: "contain",
								maxHeight: "80vh",
								width: "100%",
							}}
						>
							<track kind="captions" />
						</video>
					</div>
				)}
				{file.type.startsWith("application/") && (
					<div className="mx-auto flex w-full max-w-md items-center gap-3 rounded-lg bg-muted p-6">
						<div className="rounded-full bg-primary/10 p-4">
							<FileIcon className="size-8" />
						</div>
						<div className="flex flex-col">
							<span className="font-medium text-lg">{file.name}</span>
							<span className="text-muted-foreground text-sm">
								{(file.size / (1024 * 1024)).toFixed(2)} MB
							</span>
						</div>
					</div>
				)}
				{/* Caption Input*/}
				<div className="mx-auto mt-4 max-w-md">
					<Input
						value={caption}
						onChange={(e) => onCaptionChange(e.target.value)}
						placeholder="Add a caption... (Press Enter to send)"
						className="w-full bg-muted/50"
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								onSubmit();
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
}

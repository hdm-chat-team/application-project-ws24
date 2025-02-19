import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, SendHorizontal, X } from "lucide-react";

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
			{/* Button to remove the attachment */}
			<Button
				variant="secondary"
				size="icon"
				onClick={onRemove}
				className="absolute top-4 right-4 z-10 rounded-full hover:bg-destructive"
			>
				<X size={16} />
			</Button>
			<div className="flex w-full max-w-lg flex-col items-center p-8">
				{/* Preview of the attachment */}
				<div className="w-full">
					{file.type.startsWith("image/") && (
						<img
							src={URL.createObjectURL(file)}
							alt="Preview"
							className="max-h-[400px] w-full rounded-lg object-contain"
						/>
					)}

					{file.type.startsWith("video/") && (
						<video
							src={URL.createObjectURL(file)}
							controls
							className="max-h-[400px] w-full rounded-lg object-contain"
						>
							<track kind="captions" />
						</video>
					)}

					{file.type === "application/pdf" && (
						<div className="flex flex-col items-center">
							<div className="relative aspect-[3/4] max-h-[400px] w-full overflow-hidden rounded-lg bg-white shadow-lg">
								<embed
									src={URL.createObjectURL(file)}
									type="application/pdf"
									className="h-full w-full"
								/>
								<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
									<div className="flex items-center gap-2 text-white">
										<FileText size={20} />
										<span className="font-medium">{file.name}</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="mt-6 flex w-full max-w-2xl items-center gap-2">
					{/* Input field to add a caption */}
					<Input
						value={caption}
						onChange={(e) => onCaptionChange(e.target.value)}
						placeholder="Add a caption"
						className="w-full bg-muted/50 py-6 text-lg"
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								onSubmit();
							}
						}}
					/>
					<Button
						onClick={onSubmit}
						size="icon"
						className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700"
					>
						<SendHorizontal size={20} />
					</Button>
				</div>
			</div>
		</div>
	);
}

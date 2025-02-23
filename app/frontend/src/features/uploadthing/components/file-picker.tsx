import { FileText, ImageIcon, Video } from "lucide-react";
import { FileButton } from "./file-button";

interface FilePickerProps {
	onFileSelect: (file: File) => void;
}

export function FilePicker({ onFileSelect }: FilePickerProps) {
	return (
		<div className="space-y-8">
			<h2 className="text-center text-xl">Pick a file</h2>
			<div className="grid grid-cols-2 gap-4">
				<FileButton
					id="imageInput"
					icon={ImageIcon}
					label="Image"
					accept="image/*"
					onFileSelect={onFileSelect}
				/>
				<FileButton
					id="videoInput"
					icon={Video}
					label="Video"
					accept="video/*"
					onFileSelect={onFileSelect}
				/>
				<FileButton
					id="pdfInput"
					icon={FileText}
					label="Document"
					accept=".pdf"
					onFileSelect={onFileSelect}
					className="col-span-2"
				/>
			</div>
		</div>
	);
}

import { fileUrl } from "@/features/uploadthing/utils";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { FileIcon } from "lucide-react";

export function MessageAttachments({ messageId }: { messageId: string }) {
	const file = useLiveQuery(
		() => db.files.where("customId").equals(messageId).first(),
		[messageId],
	);
	if (!file) return null;
	return (
		<div className="space-y-2">
			{file.type.startsWith("image") && (
				<div className="relative max-h-[300px] max-w-[280px] overflow-hidden rounded-lg">
					<img
						src={
							file.blob
								? URL.createObjectURL(file.blob)
								: fileUrl(file.customId)
						}
						alt={file.originalName}
						className="h-auto w-full object-contain"
						loading="lazy"
					/>
				</div>
			)}
			{file.type.startsWith("video") && (
				<div className="relative max-h-[300px] max-w-[280px] overflow-hidden rounded-lg">
					<video
						src={
							file.blob
								? URL.createObjectURL(file.blob)
								: fileUrl(file.customId)
						}
						controls
						className="h-auto w-full"
						preload="metadata"
					>
						<track kind="captions" />
					</video>
				</div>
			)}
			{!file.type.startsWith("image") && !file.type.startsWith("video") && (
				<a
					href={
						file.blob ? URL.createObjectURL(file.blob) : fileUrl(file.customId)
					}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 rounded bg-black/10 p-2 hover:bg-black/20"
				>
					<FileIcon className="size-4" />
					<span className="text-sm">{file.originalName}</span>
				</a>
			)}
		</div>
	);
}

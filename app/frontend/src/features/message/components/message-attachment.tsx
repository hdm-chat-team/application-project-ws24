import { useLiveQuery } from "dexie-react-hooks";
import { FileIcon } from "lucide-react";
import { attachmentsByMessageIdQueryFn } from "../queries";

export function MessageAttachments({ messageId }: { messageId: string }) {
	const attachments = useLiveQuery(
		() => attachmentsByMessageIdQueryFn(messageId),
		[messageId],
	);
	return (
		<>
			{attachments?.map((attachment) => (
				<div key={attachment.url} className="space-y-2">
					{attachment.type.startsWith("image") && (
						<div className="relative max-h-[300px] max-w-[280px] overflow-hidden rounded-lg">
							<img
								src={
									attachment.blob
										? URL.createObjectURL(attachment.blob)
										: attachment.url
								}
								alt="attachment"
								className="h-auto w-full object-contain"
								loading="lazy"
							/>
						</div>
					)}
					{attachment.type.startsWith("video") && (
						<div className="relative max-h-[300px] max-w-[280px] overflow-hidden rounded-lg">
							<video
								src={
									attachment.blob
										? URL.createObjectURL(attachment.blob)
										: attachment.url
								}
								controls
								className="h-auto w-full"
								preload="metadata"
							>
								<track kind="captions" label="Captions" />
							</video>
						</div>
					)}
					{attachment.type.startsWith("application") && (
						<a
							href={
								attachment.blob
									? URL.createObjectURL(attachment.blob)
									: attachment.url
							}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 rounded bg-black/10 p-2 hover:bg-black/20"
						>
							<FileIcon className="size-4" />
							<span className="text-sm">Document</span>
						</a>
					)}
				</div>
			))}
		</>
	);
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUploadThing } from "@/features/uploadthing/hooks";
import type { FileRouter } from "@server/api/uploadthing";
import type { UseUploadthingProps } from "@uploadthing/react";
import type { ClientUploadedFileData } from "uploadthing/types";

type UploadAvatarProps = Omit<
	UseUploadthingProps<FileRouter["avatar"], FileRouter>,
	"onClientUploadComplete"
> & {
	avatarUrl?: string;
	fallback: string;
	onClientUploadComplete?: (
		res: ClientUploadedFileData<FileRouter["avatar"]["$types"]["output"]>[],
	) => void;
};

export function AvatarUploader({
	avatarUrl,
	fallback,
	headers,
	signal,
	onBeforeUploadBegin,
	onUploadBegin,
	onUploadProgress,
	onUploadError,
	onClientUploadComplete,
}: UploadAvatarProps) {
	const { startUpload, isUploading } = useUploadThing(
		(routeRegistry) => routeRegistry.avatar,
		{
			headers,
			signal,
			onBeforeUploadBegin,
			onUploadBegin,
			onUploadProgress,
			onUploadError,
			onClientUploadComplete,
		},
	);

	return (
		<>
			<label htmlFor="avatar-upload" className="cursor-pointer">
				<Avatar className="size-24">
					<AvatarImage
						src={avatarUrl}
						alt={fallback}
						className="size-full rounded-full object-cover"
					/>
					<AvatarFallback>{fallback}</AvatarFallback>
				</Avatar>
			</label>
			<input
				id="avatar-upload"
				type="file"
				accept="image/*"
				className="hidden"
				onChange={(event) => {
					if (event.target.files) {
						startUpload(Array.from(event.target.files));
					}
				}}
				disabled={isUploading}
			/>
		</>
	);
}

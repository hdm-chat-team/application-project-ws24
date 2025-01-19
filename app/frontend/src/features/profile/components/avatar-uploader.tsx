import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUploadThing } from "@/features/uploadthing/hooks";
import { cn } from "@/lib/utils";
import type { FileRouter } from "@server/api/uploadthing";
import type { UseUploadthingProps } from "@uploadthing/react";
import { Upload } from "lucide-react";
import type { ClientUploadedFileData } from "uploadthing/types";

type UploadAvatarProps = Omit<
	UseUploadthingProps<FileRouter["avatar"], FileRouter>,
	"onClientUploadComplete"
> & {
	avatarUrl?: string;
	fallback: string;
	className?: string;
	onClientUploadComplete?: (
		res: ClientUploadedFileData<FileRouter["avatar"]["$types"]["output"]>[],
	) => void;
};

export function AvatarUploader({
	avatarUrl,
	fallback,
	className,
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
		<div className={cn("flex w-full justify-center", className)}>
			<label
				htmlFor="avatar-upload"
				className="group relative aspect-square cursor-pointer"
			>
				<Avatar className="h-full w-full border border-gray-200 dark:border-gray-800">
					<AvatarImage
						src={avatarUrl}
						alt={fallback}
						className="size-full rounded-full object-cover"
					/>
					<AvatarFallback>{fallback}</AvatarFallback>
				</Avatar>
				<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
					<Upload className="size-1/3 text-white" />
				</div>
				<div className="absolute right-0 bottom-0 flex size-1/4 items-center justify-center rounded-full bg-black/50 md:hidden">
					<Upload className="size-1/2 text-white" />
				</div>
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
		</div>
	);
}

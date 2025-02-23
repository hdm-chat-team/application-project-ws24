import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useUploadUserAvatar } from "../hooks";
import { fileUrl } from "@/features/uploadthing/utils";

export function AvatarUploader({ className }: { className?: string }) {
	const { profile } = useUser();
	const { mutate: startUpload, isPending } = useUploadUserAvatar();

	return (
		<div className={cn("flex w-full justify-center", className)}>
			<label
				htmlFor="avatar-upload"
				className="group relative aspect-square cursor-pointer"
			>
				<Avatar className="h-full w-full border border-gray-200 dark:border-gray-800">
					<AvatarImage
						src={profile.avatarUrl ? fileUrl(profile.avatarUrl) : undefined}
						className="size-full rounded-full object-cover"
					/>
				</Avatar>
				<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity md:hover:opacity-100">
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
					if (event.target.files) startUpload(Array.from(event.target.files));
				}}
				disabled={isPending}
			/>
		</div>
	);
}

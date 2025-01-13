import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/features/auth";
import {
	useDeleteAvatarMutation,
	useUpdateProfileMutation,
} from "@/features/profile/hooks";
import { useForm } from "@tanstack/react-form";
import { useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AvatarUploader } from "./avatar-uploader";

const profileFormSchema = z.object({
	displayName: z.string().min(2, "Name must be at least 2 characters"),
	avatarUrl: z.string().optional(),
});

export function ProfileEditForm() {
	const { user, profile } = useUser();
	const lastAvatarUrlRef = useRef(profile.avatarUrl);

	const updateProfile = useUpdateProfileMutation().mutate;
	const deleteAvatar = useDeleteAvatarMutation().mutate;

	const form = useForm({
		defaultValues: {
			displayName: profile.displayName || "",
			avatarUrl: profile.avatarUrl || "",
		},
		onSubmit: ({ value }) => {
			try {
				updateProfile({
					displayName: value.displayName,
					avatarUrl: value.avatarUrl || "",
				});

				const avatarChanged = value.avatarUrl !== lastAvatarUrlRef.current;
				if (lastAvatarUrlRef.current && avatarChanged) {
					deleteAvatar(lastAvatarUrlRef.current);
					lastAvatarUrlRef.current = value.avatarUrl || null;
				}

				toast.success("Profile updated");
			} catch (error: unknown) {
				console.error(error);
				toast.error("Failed to update profile");
			}
		},
		validators: {
			onSubmit: profileFormSchema,
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<div className="flex w-full items-center justify-center gap-4">
						<form.Field name="avatarUrl">
							{(field) => (
								<AvatarUploader
									className="size-32"
									avatarUrl={field.state.value}
									fallback={user.username}
									onClientUploadComplete={(res) => {
										field.handleChange(res[0].url);
										form.handleSubmit();
									}}
									onUploadError={(error: Error) => {
										console.error("Upload error:", error);
										toast.error("Upload failed");
									}}
								/>
							)}
						</form.Field>
					</div>
				</div>

				<form.Field name="displayName">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Display Name</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder="Enter your display name"
							/>
						</div>
					)}
				</form.Field>
				<Separator />
			</div>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button type="submit" disabled={!canSubmit}>
						{isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}

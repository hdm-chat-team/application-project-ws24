import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/features/auth";
import type { OurFileRouter } from "@server/api/uploadthing";
import { useForm } from "@tanstack/react-form";
import { UploadButton } from "@uploadthing/react";
import { useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
	useDeleteAvatarMutation,
	useUpdateProfileMutation,
} from "../hooks/use-update-profile";

// * Profile form schema, used for validation

const profileFormSchema = z.object({
	displayName: z.string().min(2, "Name must be at least 2 characters"),
	avatarUrl: z.string().optional(),
});

export function EditProfileForm() {
	const { profile } = useUser();
	const lastAvatarUrlRef = useRef(profile.avatarUrl);
	const updateProfile = useUpdateProfileMutation();
	const deleteAvatar = useDeleteAvatarMutation();

	const form = useForm({
		defaultValues: {
			displayName: profile.displayName || "",
			avatarUrl: profile.avatarUrl || "",
		},
		onSubmit: async ({ value }) => {
			try {
				await updateProfile.mutateAsync({
					displayName: value.displayName,
					avatarUrl: value.avatarUrl || "",
				});

				if (
					lastAvatarUrlRef.current &&
					value.avatarUrl !== lastAvatarUrlRef.current
				) {
					await deleteAvatar.mutateAsync(lastAvatarUrlRef.current);
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
		<Card>
			<CardHeader>
				<CardTitle>Edit Profile</CardTitle>
				<CardDescription>
					Make changes to your profile information.
				</CardDescription>
			</CardHeader>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<CardContent>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Profile Picture</Label>
							<div className="flex items-center gap-4">
								<div className="size-16 overflow-hidden rounded-full bg-muted">
									<img
										src={form.state.values.avatarUrl || profile.avatarUrl || ""}
										alt="Profile"
										className="h-full w-full object-cover"
									/>
								</div>
								<form.Field name="avatarUrl">
									{(field) => (
										<UploadButton<OurFileRouter, "imageUploader">
											endpoint="imageUploader"
											onClientUploadComplete={(res: { url: string }[]) => {
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
						<Separator />
						<form.Field name="displayName">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Display Name</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter your display name"
									/>
								</div>
							)}
						</form.Field>
						<Separator />
					</div>
				</CardContent>

				<CardFooter className="flex justify-start space-x-2">
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button type="submit" disabled={!canSubmit}>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						)}
					</form.Subscribe>
				</CardFooter>
			</form>
		</Card>
	);
}
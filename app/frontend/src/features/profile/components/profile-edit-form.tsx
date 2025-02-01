import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/features/auth/hooks";
import { useUpdateProfileMutation } from "@/features/profile/hooks";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { AvatarUploader } from "./avatar-uploader";

const profileFormSchema = z.object({
	displayName: z.string().min(2, "Name must be at least 2 characters"),
	avatarUrl: z.string().optional(),
});

export function ProfileEditForm() {
	const { profile } = useUser();

	const updateProfile = useUpdateProfileMutation().mutate;

	const form = useForm({
		defaultValues: {
			displayName: profile.displayName || "",
		},
		onSubmit: ({ value }) => {
			try {
				updateProfile({
					displayName: value.displayName,
					avatarUrl: profile.avatarUrl || "",
				});
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
						<AvatarUploader className="size-32" />
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

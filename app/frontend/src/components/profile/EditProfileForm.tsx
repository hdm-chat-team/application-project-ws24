import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Input } from "../ui/input";

// * min length 2 characters

const profileFormSchema = z.object({
	displayName: z.string().min(2, "Name must be at least 2 characters"),
});

// * Ensure type safety

type EditProfileFormProps = {
	initialName: string;
	onSubmit: (name: string) => void;
	onCancel: () => void;
	isLoading?: boolean;
};

export function EditProfileForm({
	initialName,
	onSubmit,
	onCancel,
	isLoading,
}: EditProfileFormProps) {
	const form = useForm({
		defaultValues: {
			displayName: initialName,
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value.displayName);
			form.reset();
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
										disabled={isLoading}
									/>
								</div>
							)}
						</form.Field>
						<Separator />
					</div>
				</CardContent>

				<CardFooter className="flex justify-start space-x-2">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button type="submit" disabled={!canSubmit || isLoading}>
								{isLoading || isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						)}
					</form.Subscribe>
				</CardFooter>
			</form>
		</Card>
	);
}

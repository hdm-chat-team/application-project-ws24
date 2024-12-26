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
import { useState } from "react";
import { Input } from "../ui/input";

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
	const [name, setName] = useState(initialName);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(name.trim());
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Edit Profile</CardTitle>
				<CardDescription>
					Make changes to your profile information.
				</CardDescription>
			</CardHeader>

			<form onSubmit={handleSubmit}>
				<CardContent>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="displayName">Display Name</Label>
							<Input
								id="displayName"
								type="text"
								value={name}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setName(e.target.value)
								}
								required
								minLength={2}
								placeholder="Enter your display name"
							/>
						</div>

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
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Saving..." : "Save Changes"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

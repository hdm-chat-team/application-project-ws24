import { useState } from "react";

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
		<div>
			<form onSubmit={handleSubmit}>
				<div>
					<label>
						Display Name
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							minLength={2}
							placeholder="Enter your display name"
						/>
					</label>
				</div>

				<div>
					<button type="submit" disabled={isLoading}>
						{isLoading ? "Saving..." : "Save Changes"}
					</button>
					<button type="button" onClick={onCancel}>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}

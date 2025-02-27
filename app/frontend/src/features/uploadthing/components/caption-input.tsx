import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

interface CaptionInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
}

export function CaptionInput({ value, onChange, onSubmit }: CaptionInputProps) {
	return (
		<div className="flex gap-2">
			<Input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Add a caption..."
				className="flex-1"
				onKeyDown={(event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault();
						onSubmit();
					}
				}}
			/>
			<Button onClick={onSubmit} className="rounded-full">
				<ArrowLeft className="rotate-[135deg]" size={20} />
			</Button>
		</div>
	);
}

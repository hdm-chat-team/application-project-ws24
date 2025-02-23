import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface FileButtonProps {
	id: string;
	icon: LucideIcon;
	label: string;
	accept: string;
	onFileSelect: (file: File) => void;
	className?: string;
}

export function FileButton({
	id,
	icon: Icon,
	label,
	accept,
	onFileSelect,
	className,
}: FileButtonProps) {
	return (
		<>
			<Button
				onClick={() => document.getElementById(id)?.click()}
				className={`flex h-32 flex-col items-center gap-2 border-2 border-red-500 bg-transparent hover:bg-red-500/10 ${className}`}
			>
				<Icon size={32} />
				<span>{label}</span>
			</Button>
			<input
				id={id}
				type="file"
				accept={accept}
				className="hidden"
				onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
			/>
		</>
	);
}
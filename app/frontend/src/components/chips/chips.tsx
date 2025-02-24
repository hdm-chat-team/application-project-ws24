type ChipProps = {
	label: string;
	active: boolean;
	onClick: () => void;
};
function Chip({ label, active, onClick }: ChipProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`${
				active
					? "border border-green-300 bg-green-100 text-green-800"
					: "bg-white text-gray-800 hover:bg-slate-100"
			} rounded-full px-2 py-1 text-sm`}
		>
			{label}
		</button>
	);
}
export default Chip;

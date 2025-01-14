import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SidebarNavProps {
	onSearch: (searchQuery: string) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ onSearch }) => {
	const [searchQuery, setSearchQuery] = React.useState("");

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch(searchQuery);
	};

	return (
		<div className="flex items-center gap-2 border-gray-700 border-b bg-gray-800 p-4">
			<form onSubmit={handleSearch} className="flex w-full items-center gap-2">
				<Input
					type="text"
					placeholder="Suche nach einem Chat..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="flex-1"
				/>
				<Button type="submit" variant="default">
					Suche
				</Button>
			</form>
		</div>
	);
};

export default SidebarNav;

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useChat } from "@/features/chat/context";
import { Search, X } from "lucide-react";
import { useState } from "react";

export function ChatHeader() {
	const { chat } = useChat();
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	/* 
	TODO: PLACEHOLDER here the Bildlink must be added
	TODO: maybe a sidebar for all the meta data of the chat
	<Search />
	*/

	return (
		chat && (
			<header className="sticky top-0 flex h-[var(--header-height)] items-center gap-4 bg-background px-4">
				<SidebarTrigger className="-ml-1" />
				<div className="flex items-center gap-5">
					<Avatar>
						<AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmStm5d-komRukWTSOYWnVAhDo5i2PbrBhIA&s" />
					</Avatar>
					<div>
						<p className="font-medium text-sm">{chat.name}</p>
					</div>
				</div>
				<div className="ml-auto flex items-center gap-2">
					{isSearchOpen ? (
						<div className="flex items-center gap-2">
							<Input
								placeholder="Search Chat..."
								className="w-64 scale-100 transform transition-all duration-300 ease-in-out"
							/>
							<X
								className="cursor-pointer"
								size="1.1rem"
								onClick={() => setIsSearchOpen((prev) => !prev)}
							/>
						</div>
					) : (
						<Search
							className="scale-100 transform cursor-pointer transition-all duration-300 ease-in-out"
							size="1.1rem"
							onClick={() => setIsSearchOpen((prev) => !prev)}
						/>
					)}
				</div>
			</header>
		)
	);
}

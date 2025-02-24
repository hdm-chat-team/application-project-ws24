import Logo from "@assets/hdmChat.svg";
import { Link } from "@tanstack/react-router";
import { LogOut, Settings, User } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useUser } from "@/features/auth/hooks";
import api from "@/lib/api";

export default function TopNav() {
	const { profile } = useUser();

	const handleSettingsClick = () => {
		alert("Will be implemented in the future");
	};

	const handleLogoutClick = () => {
		const from = window.location.href;
		window.location.href = api.auth.signout
			.$url({ query: { from } })
			.toString();
	};


	return (
		<div className="flex items-center justify-between bg-red-600 px-4 py-3 text-white shadow-md dark:bg-[#2b0306] h-[var(--header-height)]">
			<div className="flex items-center space-x-2">
				<img src={Logo} alt="Logo" className="h-14 w-16 sm:h-14 sm:w-14" />
			</div>

			<div className="flex items-center space-x-4">
				<ModeToggle />
				<DropdownMenu>
					<DropdownMenuTrigger className="relative flex cursor-pointer items-center justify-center focus:outline-none">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 font-bold text-black text-sm sm:text-base">
							<Avatar>
								<AvatarImage src={profile.avatarUrl ?? undefined} />
							</Avatar>
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-40 rounded-lg bg-white text-black shadow-lg"
					>
						<Link to="/user">
							<DropdownMenuItem>
								<User className="mr-2 h-4 w-4" />
								Profile
							</DropdownMenuItem>
						</Link>
						<DropdownMenuItem onClick={handleSettingsClick}>
							<Settings className="mr-2 h-4 w-4" />
							Settings
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleLogoutClick}>
							<LogOut className="mr-2 h-4 w-4" />
							Logout
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

import { UserCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"; // shadcn scroll area
import { Badge } from "@/components/ui/badge"; // shadcn badge

interface User {
	id: string;
	name: string;
	message: string;
	timestamp: string;
	unreadCount?: number;
}

interface SidebarProps {
	users: User[];
	onSelectUser: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ users, onSelectUser }) => {
	return (
		<div className="h-full w-1/4 border-r bg-gray-900 text-white">
			<ScrollArea className="h-full">
				<ul className="space-y-2 p-4">
					{users.map((user) => (
						<li key={user.id} className="rounded-md hover:bg-gray-800">
							<button
								type="button" // Explicitly set the button type to avoid unintended form submission behavior
								onClick={() => onSelectUser(user.id)}
								onKeyUp={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										onSelectUser(user.id);
									}
								}}
								className="flex w-full items-center gap-4 p-2 text-left focus:outline-none focus:ring-2 focus:ring-gray-600"
							>
								<UserCircle className="h-8 w-8 text-gray-400" />
								<div className="flex-1">
									<div className="flex justify-between">
										<span className="font-medium">{user.name}</span>
										<span className="text-gray-500 text-xs">{user.timestamp}</span>
									</div>
									<div className="flex justify-between items-center">
										<p className="truncate text-gray-400 text-sm">{user.message}</p>
										{user.unreadCount && (
											<Badge variant="destructive" className="text-xs">
												{user.unreadCount}
											</Badge>
										)}
									</div>
								</div>
							</button>
						</li>
					))}
				</ul>
			</ScrollArea>
		</div>
	);
};

export default Sidebar;

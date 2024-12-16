import { UserCircle } from "lucide-react";

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
		<div className="h-full w-1/4 border-gray-700 border-r bg-gray-900 text-white">
			<ul className="space-y-2">
				{users.map((user) => (
					<li
						key={user.id}
						onClick={() => onSelectUser(user.id)}
						onKeyUp={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								onSelectUser(user.id);
							}
						}}
						className="flex cursor-pointer items-center gap-4 px-4 py-2 hover:bg-gray-700"
					>
						<UserCircle className="h-8 w-8 text-gray-400" />
						<div className="flex-1">
							<div className="flex justify-between">
								<span className="font-medium">{user.name}</span>
								<span className="text-gray-500 text-xs">{user.timestamp}</span>
							</div>
							<div className="flex justify-between">
								<p className="truncate text-gray-400 text-sm">{user.message}</p>
								{user.unreadCount && (
									<span className="rounded-full bg-red-500 px-2 py-0.5 text-white text-xs">
										{user.unreadCount}
									</span>
								)}
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Sidebar;

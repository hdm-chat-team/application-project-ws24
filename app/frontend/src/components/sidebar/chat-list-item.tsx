import { CircleUserRound } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
interface ChatListItemProps {
	id: string;
	avatar: string;
	name: string;
	lastMessage?: string;
	isActive?: boolean; 
	onClick: (id: string) => void;
	allRead?: boolean; 
	lastMessageTime?: string; 
}

const ChatListItem: React.FC<ChatListItemProps> = ({
	id,
	avatar,
	name,
	lastMessage = "",
	isActive = false,
	onClick,
	allRead = true,
	lastMessageTime = "",
}) => {
	
	const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			onClick(id);
		}
	};

	return (
		<div
			className={` cursor-pointer flex items-center justify-between w-full  ${
				isActive ? "bg-blue-100" : ""
			}`}
			onClick={() => onClick(id)}
			onKeyPress={handleKeyPress}
		>
			
			<div className="flex items-center my-5 mr-2">
				<Avatar>
					<AvatarImage src={avatar} />
				</Avatar>

				<div className="flex flex-col ml-3">
					<span className="font-semibold text-gray-800 capitalize">{name}</span>
					<span className="text-sm text-gray-500 truncate" title={lastMessage}>
						{lastMessage}
					</span>
				</div>
			</div>

	
			<div className="flex items-center space-x-2">
				{lastMessageTime && (
					<span className="text-xs text-gray-400">
						{(() => {
							const messageDate = new Date(lastMessageTime);
							const today = new Date();

					
							if (
								messageDate.getDate() === today.getDate() &&
								messageDate.getMonth() === today.getMonth() &&
								messageDate.getFullYear() === today.getFullYear()
							) {
								return messageDate.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								});
							}

							
							return messageDate
								.toLocaleDateString("en-US", {
									day: "numeric",
									month: "short",
								})
								.toUpperCase();
						})()}
					</span>
				)}
				{!allRead && (
					<span
						className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
						title="Unread messages"
					>
						{""}
					</span>
				)}
			</div>
		</div>
	);
};

export default ChatListItem;

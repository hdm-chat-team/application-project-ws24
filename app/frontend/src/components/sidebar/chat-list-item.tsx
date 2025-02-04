import { CircleUserRound } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
interface ChatListItemProps {
	id: string;
	avatar: string;
	name: string;
	lastMessage?: string;
	isActive?: boolean; // Indicates if the chat is currently open
	onClick: (id: string) => void;
	allRead?: boolean; // Indicates if all messages are read
	lastMessageTime?: string; // Time of the last message
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
	// Handle key press events (Enter or Space)
	const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			onClick(id);
		}
	};

	return (
		<div
			className={` cursor-pointer flex items-center justify-between ${
				isActive ? "bg-blue-100" : ""
			}`}
			onClick={() => onClick(id)}
			onKeyPress={handleKeyPress}
		>
			{/* User Info */}
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

			{/* Message Status */}
			<div className="flex items-center space-x-2">
				{/* Last message time */}
				{lastMessageTime && (
					<span className="text-xs text-gray-400">
						{(() => {
							const messageDate = new Date(lastMessageTime);
							const today = new Date();

							// Check if the message is from today
							if (
								messageDate.getDate() === today.getDate() &&
								messageDate.getMonth() === today.getMonth() &&
								messageDate.getFullYear() === today.getFullYear()
							) {
								// Return time in HH:MM format
								return messageDate.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								});
							} else {
								// Return date in "DD MMM" format (e.g., "4 NOV")
								return messageDate
									.toLocaleDateString("en-US", {
										day: "numeric",
										month: "short",
									})
									.toUpperCase();
							}
						})()}
					</span>
				)}
				{!allRead && (
					<span
						className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
						title="Unread messages"
					></span>
				)}
			</div>
		</div>
	);
};

export default ChatListItem;

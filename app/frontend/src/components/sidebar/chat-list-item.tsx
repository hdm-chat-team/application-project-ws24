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
			className={` flex w-full cursor-pointer items-center justify-between ${
				isActive ? "bg-blue-100" : ""
			}`}
			onClick={() => onClick(id)}
			onKeyPress={handleKeyPress}
		>
			<div className="my-5 mr-2 flex items-center">
				<Avatar>
					<AvatarImage src={avatar} />
				</Avatar>

				<div className="ml-3 flex flex-col">
					<span className="font-semibold text-gray-800 capitalize">{name}</span>
					<span className="truncate text-gray-500 text-sm" title={lastMessage}>
						{lastMessage}
					</span>
				</div>
			</div>

			<div className="flex items-center space-x-2">
				{lastMessageTime && (
					<span className="text-gray-400 text-xs">
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
						className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 font-semibold text-white text-xs"
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

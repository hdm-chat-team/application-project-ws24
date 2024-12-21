import type React from "react";

interface IChatNav {
	username: string;
	profilePicture?: string; // Optional profile picture
}

const ChatNav: React.FC<IChatNav> = ({ username, profilePicture }) => {
	return (
		<div className="flex items-center gap-4 border-gray-700 border-b bg-gray-800 p-4 text-white">
			{profilePicture ? (
				<img
					src={profilePicture}
					alt={`${username}'s profile`}
					className="h-10 w-10 rounded-full"
				/>
			) : (
				<div className="h-10 w-10 rounded-full bg-gray-400" />
			)}
			<span className="font-medium text-lg">{username}</span>
		</div>
	);
};

export default ChatNav;

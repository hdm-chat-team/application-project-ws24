import React from "react";

interface IChatNav {
	username: string;
	profilePicture?: string; // Optional profile picture
}

const ChatNav: React.FC<IChatNav> = ({ username, profilePicture }) => {
	return (
		<div className="flex items-center gap-4 p-4 bg-gray-800 text-white border-b border-gray-700">
			{profilePicture ? (
				<img
					src={profilePicture}
					alt={`${username}'s profile`}
					className="h-10 w-10 rounded-full"
				/>
			) : (
				<div className="h-10 w-10 rounded-full bg-gray-400" />
			)}
			<span className="text-lg font-medium">{username}</span>
		</div>
	);
};

export default ChatNav;

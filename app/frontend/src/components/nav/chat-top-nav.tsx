import type React from "react";

interface IChatNav {
	username: string;
	profilePicture?: string;
}

const ChatTopNav: React.FC<IChatNav> = ({ username, profilePicture }) => {
	return (
		<div className="flex items-center gap-4 border-gray-300 border-b bg-white p-4 text-black">
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

export default ChatTopNav;

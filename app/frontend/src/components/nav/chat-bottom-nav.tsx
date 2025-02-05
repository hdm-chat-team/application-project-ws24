import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ChatBottomNavProps {
	onSendMessage: (message: string) => void;
}

const ChatBottomNav: React.FC<ChatBottomNavProps> = ({ onSendMessage }) => {
	const [message, setMessage] = React.useState("");

	const handleSend = (e: React.FormEvent) => {
		e.preventDefault();
		if (message.trim()) {
			onSendMessage(message);
			setMessage("");
		}
	};

	return (
		<div className="flex items-center gap-2 border-gray-700 border-b bg-gray-800 p-4">
			<form onSubmit={handleSend} className="flex w-full items-center gap-2">
				<Input
					type="text"
					placeholder="Type a message..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="flex-1"
				/>
				<Button type="submit" variant="default">
					Send
				</Button>
			</form>
		</div>
	);
};

export default ChatBottomNav;

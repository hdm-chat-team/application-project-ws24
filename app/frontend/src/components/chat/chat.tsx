import ChatBottomNav from "@/components/nav/chat-bottom-nav";
import ChatTopNav from "@/components/nav/chat-top-nav";

interface Message {
	id: string;
	sender: string;
	content: string;
	timestamp: string;
}

interface ChatContentProps {
	messages: Message[];
	onSendMessage: (message: string) => void;
	username: string;
	profilePicture?: string;
}

const ChatContent: React.FC<ChatContentProps> = ({
	messages,
	onSendMessage,
	username,
	profilePicture,
}) => {
	return (
		<div className="flex h-[93vh] w-full flex-col bg-gray-100 dark:bg-slate-500 dark:text-white">
			<ChatTopNav username={username} profilePicture={profilePicture} />
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex ${
							msg.sender === "me" ? "justify-end" : "justify-start"
						}`}
					>
						<div
							className={`max-w-sm rounded-lg p-2 ${
								msg.sender === "me"
									? "bg-blue-500 text-white"
									: "bg-gray-300 text-gray-900"
							}`}
						>
							<p>{msg.content}</p>
							<span className="text-gray-500 text-xs">{msg.timestamp}</span>
						</div>
					</div>
				))}
			</div>
			<ChatBottomNav onSendMessage={onSendMessage} />
		</div>
	);
};

export default ChatContent;

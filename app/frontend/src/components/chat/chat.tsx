import { Button } from "../ui/button";

interface Message {
	id: string;
	sender: string;
	content: string;
	timestamp: string;
}

interface ChatContentProps {
	messages: Message[];
	onSendMessage: (message: string) => void;
	handleSubmit: (e: React.FormEvent) => void;
	inputMessage: string;
	setInputMessage: React.Dispatch<React.SetStateAction<string>>;
}

const ChatContent: React.FC<ChatContentProps> = ({
	messages,
	onSendMessage,
	handleSubmit,
	inputMessage,
	setInputMessage,
}) => {
	return (
		<div className="flex h-[90%] w-3/4 flex-col bg-gray-100">
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
			<form
				onSubmit={handleSubmit}
				className="flex items-center gap-2 border-gray-300 border-t p-4"
			>
				<input
					type="text"
					className="flex-1 rounded-lg border px-4 py-2 focus:outline-none"
					placeholder="Type a message..."
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
				/>
				<Button
					type="submit"
					className="rounded-lg bg-blue-500 px-4 py-2 text-white"
				>
					Send
				</Button>
			</form>
		</div>
	);
};

export default ChatContent;

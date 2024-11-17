import { useState } from "react";
import { useMessageService } from "../lib/hooks/use-message-service";

// * Component to input a message which will be added to the local database
export default function MessageInput() {
	const { addMessage } = useMessageService();
	const [inputMessage, setInputMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (inputMessage.trim()) {
			await addMessage(inputMessage);
			setInputMessage("");
		}
	};

	// * Return a form to input a message
	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				value={inputMessage}
				onChange={(e) => setInputMessage(e.target.value)}
				placeholder="Nachricht eingeben"
			/>
			<button type="submit">Nachricht senden</button>
		</form>
	);
}

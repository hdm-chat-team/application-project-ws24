import { useLiveQuery } from "dexie-react-hooks";
import { createContext, useContext, useState } from "react";
import { chatByIdQueryFn } from "../queries";
import type { LocalChat } from "../utils";

type ChatContextType = {
	chat: LocalChat | undefined;
	setChatId: (id: string) => void;
};

export const ChatContext = createContext<ChatContextType | undefined>(
	undefined,
);

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const [chatId, setChatId] = useState<string>(); // ? persist this in local storage?
	const chat = useLiveQuery(
		() => (chatId ? chatByIdQueryFn(chatId) : undefined),
		[chatId],
	);

	return (
		<ChatContext.Provider value={{ chat, setChatId }}>
			{children}
		</ChatContext.Provider>
	);
}

/**
 * Custom hook to access the ChatContext.
 * @returns chat - The current chat object or undefined if no chat is selected
 * @returns setChatId - Function to set the current chat ID
 * @throws {Error} If used outside of a ChatProvider
 */
export function useChat() {
	const context = useContext(ChatContext);
	if (context === undefined)
		throw new Error("useChat must be used within a ChatProvider");

	return context;
}

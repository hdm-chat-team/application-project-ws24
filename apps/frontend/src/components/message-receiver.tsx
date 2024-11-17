import { useEffect } from 'react';
import { useMessageService } from '../lib/message-service';

// * Component to handle received messages
export const MessageReceiver = ({ receivedMessage }: { receivedMessage: string }) => {
    const { addReceivedMessage } = useMessageService();

    // * Add the received message to the local database when its not empty
    useEffect(() => {
        const saveMessage = async () => {
        if (receivedMessage.trim()) {
            addReceivedMessage(receivedMessage);
        }
    };
    saveMessage();
    }, [receivedMessage, addReceivedMessage]);

    return null;
};

export { MessageReceiver as default };